'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);

  const reviews = [
    {
      id: 1,
      customer: { name: 'Ama Osei', email: 'ama.osei@example.com', avatar: 'AO' },
      product: { name: 'Premium Leather Crossbody Bag', image: 'https://readdy.ai/api/search-image?query=elegant%20premium%20leather%20crossbody%20bag%20in%20deep%20forest%20green%20color%20on%20clean%20white%20background&width=150&height=150&seq=revprod1&orientation=squarish' },
      rating: 5,
      title: 'Absolutely love this bag!',
      comment: 'The quality is exceptional. The leather feels premium and the craftsmanship is excellent. Perfect size for everyday use and the color is gorgeous!',
      date: 'Dec 20, 2024',
      status: 'Pending',
      helpful: 0
    },
    {
      id: 2,
      customer: { name: 'Kwame Mensah', email: 'kwame.m@example.com', avatar: 'KM' },
      product: { name: 'Designer Brass Table Lamp', image: 'https://readdy.ai/api/search-image?query=contemporary%20designer%20brass%20table%20lamp%20with%20elegant%20silhouette%20on%20white%20background&width=150&height=150&seq=revprod2&orientation=squarish' },
      rating: 4,
      title: 'Great lamp, minor shipping delay',
      comment: 'Beautiful design and good quality. Took a bit longer to arrive than expected but worth the wait. Adds a nice touch to my office.',
      date: 'Dec 19, 2024',
      status: 'Pending',
      helpful: 0
    },
    {
      id: 3,
      customer: { name: 'Efua Asante', email: 'efua.asante@example.com', avatar: 'EA' },
      product: { name: 'Organic Cotton Throw Blanket', image: 'https://readdy.ai/api/search-image?query=luxurious%20organic%20cotton%20throw%20blanket%20in%20soft%20cream%20color%20on%20white%20background&width=150&height=150&seq=revprod3&orientation=squarish' },
      rating: 5,
      title: 'So soft and cozy!',
      comment: 'This blanket exceeded my expectations. The organic cotton is incredibly soft and the weight is perfect. Beautiful neutral color that goes with everything.',
      date: 'Dec 18, 2024',
      status: 'Pending',
      helpful: 0
    },
    {
      id: 4,
      customer: { name: 'Kofi Adjei', email: 'kofi.adjei@example.com', avatar: 'KA' },
      product: { name: 'Minimalist Ceramic Vase Set', image: 'https://readdy.ai/api/search-image?query=modern%20minimalist%20ceramic%20vase%20set%20in%20matte%20cream%20color%20on%20white%20background&width=150&height=150&seq=revprod4&orientation=squarish' },
      rating: 3,
      title: 'Nice but smaller than expected',
      comment: 'The vases are beautiful and well-made, but they are smaller than I thought based on the photos. Still nice quality though.',
      date: 'Dec 17, 2024',
      status: 'Pending',
      helpful: 0
    },
    {
      id: 5,
      customer: { name: 'Abena Mensah', email: 'abena.m@example.com', avatar: 'AM' },
      product: { name: 'Handwoven Wall Tapestry', image: 'https://readdy.ai/api/search-image?query=artistic%20handwoven%20wall%20tapestry%20with%20geometric%20patterns%20in%20natural%20tones%20on%20white%20background&width=150&height=150&seq=revprod5&orientation=squarish' },
      rating: 5,
      title: 'Stunning piece of art!',
      comment: 'This tapestry is absolutely gorgeous! The craftsmanship is incredible and it looks even better in person. Perfect statement piece for my living room.',
      date: 'Dec 16, 2024',
      status: 'Pending',
      helpful: 0
    }
  ];

  const approvedReviews = [
    {
      id: 6,
      customer: { name: 'Yaw Boateng', email: 'yaw.b@example.com', avatar: 'YB' },
      product: { name: 'Premium Scented Candles', image: 'https://readdy.ai/api/search-image?query=luxury%20scented%20candles%20in%20minimalist%20glass%20containers%20with%20wooden%20lids%20on%20white%20background&width=150&height=150&seq=revprod6&orientation=squarish' },
      rating: 5,
      title: 'Amazing scents!',
      comment: 'These candles smell incredible and burn evenly. Love the minimalist packaging too.',
      date: 'Dec 15, 2024',
      status: 'Approved',
      helpful: 12
    },
    {
      id: 7,
      customer: { name: 'Akosua Darko', email: 'akosua.d@example.com', avatar: 'AD' },
      product: { name: 'Artisan Coffee Mug Set', image: 'https://readdy.ai/api/search-image?query=elegant%20artisan%20ceramic%20coffee%20mug%20set%20in%20matte%20glaze%20finish%20on%20white%20background&width=150&height=150&seq=revprod7&orientation=squarish' },
      rating: 4,
      title: 'Beautiful mugs',
      comment: 'Great quality and design. Perfect for my morning coffee ritual.',
      date: 'Dec 14, 2024',
      status: 'Approved',
      helpful: 8
    }
  ];

  const displayReviews = statusFilter === 'pending' ? reviews : statusFilter === 'approved' ? approvedReviews : [...reviews, ...approvedReviews];

  const statusColors: any = {
    'Pending': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === displayReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(displayReviews.map(r => r.id));
    }
  };

  const handleSelectReview = (reviewId: number) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`${star <= rating ? 'ri-star-fill text-amber-500' : 'ri-star-line text-gray-300'} text-lg`}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Moderate and manage customer reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'all' ? 'border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">87</p>
          <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'pending' ? 'border-amber-700 bg-amber-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-2xl font-bold text-amber-700">5</p>
          <p className="text-sm text-gray-600 mt-1">Pending Review</p>
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'approved' ? 'border-emerald-700 bg-emerald-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-2xl font-bold text-emerald-700">79</p>
          <p className="text-sm text-gray-600 mt-1">Approved</p>
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            statusFilter === 'rejected' ? 'border-red-700 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        >
          <p className="text-2xl font-bold text-red-700">3</p>
          <p className="text-sm text-gray-600 mt-1">Rejected</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {statusFilter === 'pending' ? 'Pending Reviews' : statusFilter === 'approved' ? 'Approved Reviews' : 'All Reviews'}
            </h2>
            <select className="px-4 py-2 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium cursor-pointer">
              <option>Sort by Date</option>
              <option>Sort by Rating</option>
              <option>Sort by Helpful</option>
            </select>
          </div>
        </div>

        {selectedReviews.length > 0 && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <p className="text-emerald-800 font-semibold">
              {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-check-line mr-2"></i>
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-close-line mr-2"></i>
                Reject
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                <i className="ri-delete-bin-line mr-2"></i>
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {displayReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.id)}
                  onChange={() => handleSelectReview(review.id)}
                  className="mt-1 w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        {review.customer.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.customer.name}</p>
                        <p className="text-sm text-gray-500">{review.customer.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColors[review.status]}`}>
                      {review.status}
                    </span>
                  </div>

                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${review.id}`} className="font-semibold text-gray-900 hover:text-emerald-700">
                        {review.product.name}
                      </Link>
                      <div className="flex items-center space-x-3 mt-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <i className="ri-thumb-up-line mr-1"></i>
                        {review.helpful} found helpful
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {review.status === 'Pending' && (
                        <>
                          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                            <i className="ri-check-line mr-2"></i>
                            Approve
                          </button>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                            <i className="ri-close-line mr-2"></i>
                            Reject
                          </button>
                        </>
                      )}
                      <button className="w-9 h-9 flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 rounded-lg transition-colors">
                        <i className="ri-reply-line"></i>
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 rounded-lg transition-colors">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-600">Showing {displayReviews.length} reviews</p>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <i className="ri-arrow-left-s-line text-xl text-gray-600"></i>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-emerald-700 text-white rounded-lg font-semibold">1</button>
            <button className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <i className="ri-arrow-right-s-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
