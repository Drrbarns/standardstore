import Link from 'next/link';

export default function CategoriesPage() {
  const categories = [
    {
      name: 'Electronics',
      description: 'Latest gadgets, smartphones, laptops, and tech accessories',
      image: 'https://readdy.ai/api/search-image?query=Modern%20electronics%20collection%20smartphones%20laptops%20headphones%20arranged%20on%20clean%20white%20surface%20with%20soft%20lighting%20minimal%20professional%20product%20photography%20style&width=600&height=400&seq=cat1&orientation=landscape',
      productCount: 145,
      icon: 'ri-smartphone-line',
      color: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Fashion',
      description: 'Trendy clothing, shoes, and accessories for all occasions',
      image: 'https://readdy.ai/api/search-image?query=Stylish%20fashion%20clothing%20collection%20hanging%20on%20modern%20rack%20elegant%20shoes%20accessories%20bright%20boutique%20setting%20clean%20minimal%20professional%20photography&width=600&height=400&seq=cat2&orientation=landscape',
      productCount: 289,
      icon: 'ri-shirt-line',
      color: 'from-pink-500 to-pink-700'
    },
    {
      name: 'Home & Living',
      description: 'Furniture, décor, kitchen essentials, and home improvement',
      image: 'https://readdy.ai/api/search-image?query=Beautiful%20modern%20home%20interior%20with%20furniture%20decorative%20items%20plants%20cozy%20living%20space%20bright%20natural%20lighting%20contemporary%20design%20magazine%20quality&width=600&height=400&seq=cat3&orientation=landscape',
      productCount: 178,
      icon: 'ri-home-smile-line',
      color: 'from-amber-500 to-amber-700'
    },
    {
      name: 'Beauty & Personal Care',
      description: 'Skincare, makeup, fragrances, and wellness products',
      image: 'https://readdy.ai/api/search-image?query=Luxury%20beauty%20products%20skincare%20cosmetics%20arranged%20elegantly%20on%20marble%20surface%20with%20natural%20lighting%20clean%20professional%20product%20photography%20style&width=600&height=400&seq=cat4&orientation=landscape',
      productCount: 234,
      icon: 'ri-heart-line',
      color: 'from-rose-500 to-rose-700'
    },
    {
      name: 'Sports & Fitness',
      description: 'Workout gear, sports equipment, and active lifestyle products',
      image: 'https://readdy.ai/api/search-image?query=Sports%20fitness%20equipment%20yoga%20mat%20dumbbells%20water%20bottle%20athletic%20gear%20arranged%20on%20clean%20surface%20bright%20energetic%20lighting%20professional%20product%20photography&width=600&height=400&seq=cat5&orientation=landscape',
      productCount: 156,
      icon: 'ri-football-line',
      color: 'from-emerald-500 to-emerald-700'
    },
    {
      name: 'Books & Stationery',
      description: 'Books, notebooks, pens, and office supplies',
      image: 'https://readdy.ai/api/search-image?query=Books%20stationery%20notebooks%20pens%20arranged%20neatly%20on%20wooden%20desk%20with%20coffee%20cup%20natural%20lighting%20cozy%20study%20atmosphere%20professional%20photography&width=600&height=400&seq=cat6&orientation=landscape',
      productCount: 92,
      icon: 'ri-book-open-line',
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      name: 'Toys & Games',
      description: 'Fun and educational toys for all ages',
      image: 'https://readdy.ai/api/search-image?query=Colorful%20toys%20games%20puzzles%20arranged%20playfully%20on%20bright%20background%20fun%20educational%20items%20clean%20cheerful%20lighting%20professional%20product%20photography&width=600&height=400&seq=cat7&orientation=landscape',
      productCount: 127,
      icon: 'ri-gamepad-line',
      color: 'from-purple-500 to-purple-700'
    },
    {
      name: 'Food & Beverages',
      description: 'Gourmet foods, snacks, drinks, and specialty items',
      image: 'https://readdy.ai/api/search-image?query=Gourmet%20food%20items%20specialty%20snacks%20beverages%20arranged%20elegantly%20on%20rustic%20wooden%20table%20natural%20lighting%20appetizing%20presentation%20professional%20food%20photography&width=600&height=400&seq=cat8&orientation=landscape',
      productCount: 83,
      icon: 'ri-restaurant-line',
      color: 'from-orange-500 to-orange-700'
    },
    {
      name: 'Automotive',
      description: 'Car accessories, tools, and maintenance products',
      image: 'https://readdy.ai/api/search-image?query=Car%20accessories%20automotive%20tools%20products%20arranged%20on%20clean%20surface%20modern%20vehicle%20parts%20professional%20lighting%20sleek%20product%20photography%20style&width=600&height=400&seq=cat9&orientation=landscape',
      productCount: 64,
      icon: 'ri-car-line',
      color: 'from-gray-500 to-gray-700'
    },
    {
      name: 'Pet Supplies',
      description: 'Everything your furry friends need',
      image: 'https://readdy.ai/api/search-image?query=Pet%20supplies%20dog%20cat%20accessories%20toys%20food%20bowls%20arranged%20on%20clean%20background%20bright%20cheerful%20lighting%20professional%20product%20photography&width=600&height=400&seq=cat10&orientation=landscape',
      productCount: 71,
      icon: 'ri-emotion-happy-line',
      color: 'from-teal-500 to-teal-700'
    },
    {
      name: 'Garden & Outdoor',
      description: 'Plants, garden tools, and outdoor living essentials',
      image: 'https://readdy.ai/api/search-image?query=Garden%20tools%20plants%20outdoor%20accessories%20arranged%20beautifully%20on%20natural%20setting%20bright%20sunlight%20fresh%20green%20atmosphere%20professional%20photography&width=600&height=400&seq=cat11&orientation=landscape',
      productCount: 58,
      icon: 'ri-plant-line',
      color: 'from-lime-500 to-lime-700'
    },
    {
      name: 'Jewellery & Watches',
      description: 'Elegant jewellery pieces and premium timepieces',
      image: 'https://readdy.ai/api/search-image?query=Luxury%20jewelry%20elegant%20watches%20arranged%20on%20velvet%20surface%20soft%20dramatic%20lighting%20premium%20sophisticated%20presentation%20professional%20product%20photography&width=600&height=400&seq=cat12&orientation=landscape',
      productCount: 103,
      icon: 'ri-vip-diamond-line',
      color: 'from-yellow-500 to-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Shop by Category</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore our curated collections and find exactly what you're looking for
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={index}
              href="/shop"
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center`}>
                    <i className={`${category.icon} text-2xl text-white`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.productCount} Products</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-emerald-700 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Browse Collection</span>
                  <i className="ri-arrow-right-line ml-2"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Shop by Category?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse curated collections to discover products tailored to your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-eye-line text-3xl text-emerald-700"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy Discovery</h3>
              <p className="text-gray-600 text-sm">Find what you need quickly without endless scrolling</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-star-line text-3xl text-emerald-700"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Curated Selection</h3>
              <p className="text-gray-600 text-sm">Every category features hand-picked quality products</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-price-tag-3-line text-3xl text-emerald-700"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Best Deals</h3>
              <p className="text-gray-600 text-sm">Category-specific promotions and special offers</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-guide-line text-3xl text-emerald-700"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">Helpful filters and sorting for smart shopping</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Try our advanced search or contact our team for personalised product recommendations
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-full font-medium hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              <i className="ri-search-line"></i>
              Search All Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-medium hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              <i className="ri-customer-service-line"></i>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
