import { useMemo, useState } from 'react';
import type { CreateStockLoadDto, StockLoad } from '@papyrus/shared';
import { StockLoadExpenseType, StockLoadStatus } from '@papyrus/shared';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useProducts, useCreateProduct } from '@/hooks/useProducts';
import { useCancelStockLoad, useCreateStockLoad, useStockLoads } from '@/hooks/useStockLoads';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { ArchiveX, Boxes, ChevronLeft, ChevronRight, PackagePlus, Plus, ReceiptText, Trash2, Truck, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ProductForm } from '@/components/products/ProductForm';

interface DraftItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

interface DraftExpense {
  type: StockLoadExpenseType;
  description: string;
  amount: number;
}

const expenseLabels: Record<StockLoadExpenseType, string> = {
  [StockLoadExpenseType.SHIPPING]: 'Envío',
  [StockLoadExpenseType.TAX]: 'Impuestos',
  [StockLoadExpenseType.PACKAGING]: 'Embalaje',
  [StockLoadExpenseType.COMMISSION]: 'Comisión',
  [StockLoadExpenseType.OTHER]: 'Otro',
};

const moneyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

const formatMoney = (value: number) => moneyFormatter.format(Number(value) || 0);

const emptyItem = (): DraftItem => ({ productId: '', quantity: 1, unitCost: 0 });
const emptyExpense = (): DraftExpense => ({
  type: StockLoadExpenseType.SHIPPING,
  description: '',
  amount: 0,
});

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    const message = error.response.data.message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }

  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}

export default function StockLoadsPage() {
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [expenses, setExpenses] = useState<DraftExpense[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<StockLoad | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCreatingProductModalOpen, setIsCreatingProductModalOpen] = useState(false);

  const { data: productsResponse } = useProducts({
    page: 1,
    limit: 1000,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const products = productsResponse?.data ?? [];

  const { data: stockLoadsResponse, isLoading } = useStockLoads({
    search,
    status: status === 'all' ? undefined : status,
    page,
    limit: 10,
  });

  const createStockLoad = useCreateStockLoad();
  const cancelStockLoad = useCancelStockLoad();
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct();

  const handleQuickProductSubmit = (data: any) => {
    createProduct(data, {
      onSuccess: (newProduct) => {
        toast.success(`Producto "${newProduct.name}" creado`);
        setIsCreatingProductModalOpen(false);
        setItems((current) => {
          const lastItem = current[current.length - 1];
          if (lastItem && !lastItem.productId) {
            return current.map((item, idx) =>
              idx === current.length - 1
                ? { productId: newProduct.id, quantity: 1, unitCost: Number(newProduct.purchasePrice) || 0 }
                : item,
            );
          } else {
            return [
              ...current,
              { productId: newProduct.id, quantity: 1, unitCost: Number(newProduct.purchasePrice) || 0 },
            ];
          }
        });
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const productById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const productSubtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0,
  );
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCost = productSubtotal + expenseTotal;
  const stockLoads = stockLoadsResponse?.data ?? [];
  const totalPages = stockLoadsResponse?.totalPages ?? 1;

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const updateExpense = (index: number, patch: Partial<DraftExpense>) => {
    setExpenses((current) =>
      current.map((expense, expenseIndex) =>
        expenseIndex === index ? { ...expense, ...patch } : expense,
      ),
    );
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = productById.get(productId);
    updateItem(index, {
      productId,
      unitCost: product ? Number(product.purchasePrice) : 0,
    });
  };

  const handleSubmit = () => {
    const validItems = items.filter((item) => item.productId);
    const repeated = new Set<string>();

    for (const item of validItems) {
      if (repeated.has(item.productId)) {
        toast.error('No repitas productos en la misma carga. Consolidá cantidades.');
        return;
      }
      repeated.add(item.productId);
    }

    if (validItems.length === 0) {
      toast.error('Agregá al menos un producto a la carga.');
      return;
    }

    const payload: CreateStockLoadDto = {
      supplierName: supplierName.trim() || undefined,
      supplierContact: supplierContact.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
      expenses: expenses
        .filter((expense) => expense.amount > 0)
        .map((expense) => ({
          type: expense.type,
          description: expense.description.trim() || undefined,
          amount: expense.amount,
        })),
    };

    createStockLoad.mutate(payload, {
      onSuccess: () => {
        toast.success('Carga de stock registrada');
        setSupplierName('');
        setSupplierContact('');
        setInvoiceNumber('');
        setNotes('');
        setItems([emptyItem()]);
        setExpenses([]);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleCancel = () => {
    if (!cancelTarget) return;

    cancelStockLoad.mutate(
      { id: cancelTarget.id, reason: cancelReason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Carga anulada y stock revertido');
          setCancelTarget(null);
          setCancelReason('');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/60 dark:bg-surface/80 bg-white/70 p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-primary">Cargas de stock</h1>
          <p className="mt-1 text-xs text-primary/60">
            Registrá ingresos de mercadería con costos, gastos detallados, historial y anulación.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 self-start sm:self-center">
          <Metric label="Productos" value={formatMoney(productSubtotal)} />
          <Metric label="Gastos" value={formatMoney(expenseTotal)} />
          <Metric label="Total" value={formatMoney(totalCost)} strong />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-gold" />
              <CardTitle>Nueva carga</CardTitle>
            </div>
            <CardDescription>
              Los datos del proveedor son opcionales. El precio de compra del producto se actualizará con el costo unitario cargado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Input label="Proveedor (opcional)" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} />
              <Input label="Contacto (opcional)" value={supplierContact} onChange={(event) => setSupplierContact(event.target.value)} />
              <Input label="Factura/remito (opcional)" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-primary/55">
                  Productos cargados
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setIsCreatingProductModalOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Nuevo Producto
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setItems((current) => [...current, emptyItem()])}>
                    <Plus className="mr-1 h-4 w-4" />
                    Fila
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const selectedProduct = productById.get(item.productId);
                  return (
                    <div key={index} className="grid gap-1.5 rounded-2xl border border-border/80 bg-bg/55 p-2 md:grid-cols-[minmax(0,1fr)_80px_100px_100px_32px]">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-primary">
                          Producto
                        </label>
                        <Select value={item.productId || 'none'} onValueChange={(value) => handleProductChange(index, value === 'none' ? '' : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Seleccionar producto</SelectItem>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        label="Cantidad"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        label="Costo unit."
                        value={item.unitCost}
                        onChange={(event) => updateItem(index, { unitCost: Math.max(0, Number(event.target.value) || 0) })}
                      />
                      <div className="rounded-xl dark:bg-surface/80 bg-white/70 px-2.5 py-1.5 border border-border/30 flex flex-col justify-center text-center">
                        <p className="text-[10px] font-semibold text-primary/45">Subtotal</p>
                        <p className="mt-0.5 text-xs font-bold text-primary">{formatMoney(item.quantity * item.unitCost)}</p>
                        {selectedProduct ? (
                          <p className="mt-0.5 text-[9px] text-primary/40 leading-none">Stock: {selectedProduct.stock}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-center text-danger"
                        disabled={items.length === 1}
                        onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-primary/55">
                  Gastos detallados
                </h2>
                <Button variant="secondary" size="sm" onClick={() => setExpenses((current) => [...current, emptyExpense()])}>
                  <Plus className="mr-1 h-4 w-4" />
                  Gasto
                </Button>
              </div>

              {expenses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-bg/45 p-5 text-sm text-primary/50">
                  Sin gastos adicionales. Podés agregar envío, impuestos, embalaje, comisión u otros.
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense, index) => (
                    <div key={index} className="grid gap-2 rounded-2xl border border-border/80 bg-bg/55 p-3 md:grid-cols-[160px_minmax(0,1fr)_130px_40px]">
                      <Select value={expense.type} onValueChange={(value) => updateExpense(index, { type: value as StockLoadExpenseType })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(StockLoadExpenseType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {expenseLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input value={expense.description} placeholder="Descripción opcional" onChange={(event) => updateExpense(index, { description: event.target.value })} />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={expense.amount}
                        onChange={(event) => updateExpense(index, { amount: Math.max(0, Number(event.target.value) || 0) })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-center text-danger"
                        onClick={() => setExpenses((current) => current.filter((_, expenseIndex) => expenseIndex !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Textarea label="Notas (opcional)" value={notes} onChange={(event) => setNotes(event.target.value)} />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-gold/10 p-4">
              <div>
                <p className="text-sm font-semibold text-primary">Total de la carga</p>
                <p className="text-2xl font-black text-primary">{formatMoney(totalCost)}</p>
              </div>
              <Button onClick={handleSubmit} disabled={createStockLoad.isPending}>
                <Truck className="mr-2 h-4 w-4" />
                {createStockLoad.isPending ? 'Registrando…' : 'Registrar carga'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-gold" />
              <CardTitle>Historial</CardTitle>
            </div>
            <CardDescription>
              Cada carga conserva costos, gastos, usuario y estado de anulación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
              <Input placeholder="Buscar proveedor, factura o nota…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={StockLoadStatus.ACTIVE}>Activas</SelectItem>
                  <SelectItem value={StockLoadStatus.CANCELLED}>Anuladas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-border bg-bg/55 p-8 text-center text-sm text-primary/50">
                Cargando historial…
              </div>
            ) : stockLoads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-bg/45 p-8 text-center">
                <Boxes className="mx-auto h-10 w-10 text-primary/20" />
                <p className="mt-3 text-sm font-semibold text-primary/55">Todavía no hay cargas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stockLoads.map((stockLoad) => (
                  <article key={stockLoad.id} className="rounded-2xl border border-border/80 dark:bg-surface/80 bg-white/70 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={stockLoad.status === StockLoadStatus.ACTIVE ? 'success' : 'danger'}>
                            {stockLoad.status === StockLoadStatus.ACTIVE ? 'Activa' : 'Anulada'}
                          </Badge>
                          {stockLoad.invoiceNumber ? (
                            <span className="text-xs font-semibold text-primary/45">#{stockLoad.invoiceNumber}</span>
                          ) : null}
                        </div>
                        <h3 className="mt-2 font-bold text-primary">
                          {stockLoad.supplierName || 'Sin proveedor'}
                        </h3>
                        <p className="mt-1 text-xs text-primary/45">
                          {new Date(stockLoad.createdAt).toLocaleString('es-AR')} · {stockLoad.user?.displayName ?? 'Usuario'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{formatMoney(stockLoad.totalCost)}</p>
                        <p className="text-xs text-primary/45">
                          {stockLoad.items.length} producto{stockLoad.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-bg/55 p-3 text-xs text-primary/60">
                      <div className="grid grid-cols-3 gap-2">
                        <span>Productos: <strong>{formatMoney(stockLoad.productSubtotal)}</strong></span>
                        <span>Gastos: <strong>{formatMoney(stockLoad.expenseTotal)}</strong></span>
                        <span>Total: <strong>{formatMoney(stockLoad.totalCost)}</strong></span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {stockLoad.items.slice(0, 3).map((item) => (
                          <p key={item.id}>
                            {item.product?.name ?? 'Producto'} · {item.quantity} u. · {formatMoney(Number(item.unitCost))}
                          </p>
                        ))}
                        {stockLoad.items.length > 3 ? <p>+ {stockLoad.items.length - 3} más…</p> : null}
                      </div>
                    </div>

                    {stockLoad.status === StockLoadStatus.ACTIVE ? (
                      <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-danger" onClick={() => setCancelTarget(stockLoad)}>
                          <ArchiveX className="mr-1 h-4 w-4" />
                          Anular
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-danger/70">
                        Anulada: {stockLoad.cancelReason || 'sin motivo especificado'}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-xs font-semibold text-primary/45">
                Página {page} de {Math.max(totalPages, 1)}
              </p>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {cancelTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-papyrus-lg">
            <Badge variant="danger">Anulación</Badge>
            <h2 className="mt-3 text-xl font-black text-primary">Anular carga de stock</h2>
            <p className="mt-2 text-sm leading-6 text-primary/60">
              Se revertirá el stock de todos los productos de esta carga. Si algún producto no tiene stock suficiente, la anulación será rechazada.
            </p>
            <Textarea
              className="mt-4"
              label="Motivo"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Error de carga, factura duplicada, mercadería no recibida…"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCancelTarget(null)}>
                Volver
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={cancelStockLoad.isPending}>
                {cancelStockLoad.isPending ? 'Anulando…' : 'Confirmar anulación'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isCreatingProductModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 pt-10 pb-10 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreatingProductModalOpen(false);
          }}
        >
          <div className="w-full max-w-xl animate-in slide-in-from-bottom-4 fade-in rounded-xl border border-border/80 bg-surface p-4 shadow-papyrus-lg duration-200 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="gold">Nuevo</Badge>
                <h2 className="text-lg font-bold text-primary">Agregar producto</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingProductModalOpen(false)}
                aria-label="Cerrar"
                className="hover:text-danger"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ProductForm
              productId={null}
              onSubmit={handleQuickProductSubmit}
              onCancel={() => setIsCreatingProductModalOpen(false)}
              isCreating={isCreatingProduct}
            />
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-inverse/5 px-2.5 py-1 border border-border/80 text-center">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary/45">{label}</p>
      <p className={cn('mt-0.5 text-xs font-black text-primary', strong && 'text-gold')}>
        {value}
      </p>
    </div>
  );
}
