import OrderDetailClient from './OrderDetailClient';

export async function generateStaticParams() {
  return [
    { id: 'ORD-2024-324' },
    { id: 'ORD-2024-323' },
    { id: 'ORD-2024-322' }
  ];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailClient orderId={params.id} />;
}
