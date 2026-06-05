import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Sparkles, BookOpenCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod, SaleItemType, type CreateSaleDto, type Product, type Sale, type Service } from '@papyrus/shared';
import { Cart } from '../components/pos/Cart';
import { ProductTable } from '../components/pos/ProductTable';
import { SaleSuccessModal } from '../components/pos/SaleSuccessModal';
import { ServiceTable } from '../components/pos/ServiceTable';
import { Button } from '../components/ui/Button';
import { useCategories } from '../hooks/useCategories';
import { useCreateSale } from '../hooks/useCreateSale';
import { useProducts } from '../hooks/useProducts';
import { useServices } from '../hooks/useServices';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

type CatalogTab = 'products' | 'services';

const categoryAll = 'all';

function parseApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message ?? 'No pudimos registrar la venta. Revisá stock, caja o conexión.';
  }

  return 'No pudimos registrar la venta. Intentá nuevamente.';
}

export default function POSPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('products');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryAll);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [cashReceived, setCashReceived] = useState('');
  const [successfulSale, setSuccessfulSale] = useState<Sale | null>(null);

  const items = useCartStore((state) => state.items);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const setDiscountAmount = useCartStore((state) => state.setDiscountAmount);
  const subtotal = useCartStore((state) => state.subtotal());
  const total = useCartStore((state) => state.total());

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    search: debouncedSearch,
    categoryId: selectedCategoryId === categoryAll ? undefined : selectedCategoryId,
    limit: 50,
  });
  const servicesQuery = useServices();
  const createSale = useCreateSale();

  // Debounce search with 500ms to avoid excessive API calls while typing
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const cashValue = Number(cashReceived || 0);
  const isCashInsufficient = paymentMethod === PaymentMethod.CASH && cashValue < total;
  const canCheckout = items.length > 0 && !isCashInsufficient && !createSale.isPending;

  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const activeServices = useMemo(() => (servicesQuery.data ?? []).filter((service) => service.isActive), [servicesQuery.data]);

  function handleAddProduct(product: Product) {
    if (product.stock <= 0) return;

    addItem({
      id: `PRODUCT:${product.id}`,
      itemType: SaleItemType.PRODUCT,
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      quantity: 1,
      maxStock: product.stock,
    });
    toast.success(`${product.name} agregado al ticket`);
  }

  function handleAddService(service: Service) {
    addItem({
      id: `SERVICE:${service.id}`,
      itemType: SaleItemType.SERVICE,
      serviceId: service.id,
      name: service.name,
      price: service.basePrice,
      quantity: 1,
    });
    toast.success(`${service.name} agregado al ticket`);
  }

  function handlePaymentMethodChange(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method !== PaymentMethod.CASH) setCashReceived('');
  }

  async function handleCheckout() {
    if (!canCheckout) {
      if (isCashInsufficient) {
        toast.error('El efectivo recibido no alcanza para cerrar la venta.');
      }
      return;
    }

    const payload: CreateSaleDto = {
      items: items.map((item) => ({
        productId: item.productId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        specifications: item.specifications,
      })),
      discountAmount,
      paymentMethod,
      cashReceived: paymentMethod === PaymentMethod.CASH ? cashValue : undefined,
    };

    try {
      const sale = await createSale.mutateAsync(payload);
      setSuccessfulSale(sale);
      clearCart();
      setCashReceived('');
      toast.success(`Ticket ${sale.ticketNumber} emitido`);
    } catch (error) {
      toast.error(parseApiError(error));
    }
  }

  return (
    <div className="space-y-6">
      {/* Main layout: table + cart */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left: Catalog area */}
        <div className="space-y-4">
          {/* Tab bar + category filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-surface/90 px-4 py-3 shadow-papyrus-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-primary/40">Catálogo</span>
              <div className="ml-1 inline-flex rounded-xl border border-border bg-bg p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                    activeTab === 'products' ? 'bg-primary text-white shadow-sm' : 'text-primary/55 hover:text-primary',
                  )}
                >
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  Productos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                    activeTab === 'services' ? 'bg-primary text-white shadow-sm' : 'text-primary/55 hover:text-primary',
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Servicios
                </button>
              </div>
            </div>

            {/* Category pills (only for products) */}
            {activeTab === 'products' && (
              <div className="flex gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide transition',
                    selectedCategoryId === categoryAll
                      ? 'border-gold bg-gold/15 text-primary'
                      : 'border-border/60 bg-white/70 text-primary/50 hover:border-gold/50 hover:text-primary',
                  )}
                  onClick={() => setSelectedCategoryId(categoryAll)}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide transition',
                      selectedCategoryId === cat.id
                        ? 'border-gold bg-gold/15 text-primary'
                        : 'border-border/60 bg-white/70 text-primary/50 hover:border-gold/50 hover:text-primary',
                    )}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product table or Service table */}
          {activeTab === 'products' ? (
            <ProductTable
              products={products}
              isLoading={productsQuery.isLoading}
              onAdd={handleAddProduct}
              search={search}
              onSearchChange={setSearch}
            />
          ) : (
            <>
              <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs leading-6 text-primary/60">
                Servicios con precio base y cantidad uno. Las especificaciones dinámicas (tamaño de hoja, color, cantidad de páginas) estarán disponibles en la próxima actualización.
              </div>
              <ServiceTable
                services={activeServices}
                isLoading={servicesQuery.isLoading}
                onAdd={handleAddService}
              />
            </>
          )}
        </div>

        {/* Right: Cart / Ticket */}
        <Cart
          items={items}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
          paymentMethod={paymentMethod}
          cashReceived={cashReceived}
          isCheckoutDisabled={!canCheckout}
          isCheckingOut={createSale.isPending}
          onDiscountChange={setDiscountAmount}
          onPaymentMethodChange={handlePaymentMethodChange}
          onCashReceivedChange={setCashReceived}
          onIncrement={increment}
          onDecrement={decrement}
          onSetQuantity={setQuantity}
          onRemove={removeItem}
          onClear={clearCart}
          onCheckout={handleCheckout}
        />
      </section>

      <SaleSuccessModal sale={successfulSale} onClose={() => setSuccessfulSale(null)} />
    </div>
  );
}
