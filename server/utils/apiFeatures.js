class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  // Full-text search
  search() {
    if (this.queryString.search) {
      const keyword = this.queryString.search.trim();
      this.query = this.query.find({
        $text: { $search: keyword },
      });
    }
    return this;
  }

  // Filter by fields
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['search', 'sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Category filter
    if (queryObj.category) {
      const cats = Array.isArray(queryObj.category) ? queryObj.category : [queryObj.category];
      this.query = this.query.where('category').in(cats);
      delete queryObj.category;
    }

    // Brand filter (multiple brands: brand=Nike,Adidas)
    if (queryObj.brand) {
      const brands = queryObj.brand.split(',').map((b) => b.trim());
      this.query = this.query.where('brand').in(brands);
      delete queryObj.brand;
    }

    // Price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceFilter = {};
      if (queryObj.minPrice) priceFilter.$gte = parseFloat(queryObj.minPrice);
      if (queryObj.maxPrice) priceFilter.$lte = parseFloat(queryObj.maxPrice);
      this.query = this.query.where('price').equals(priceFilter);
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    // Rating filter
    if (queryObj.rating) {
      this.query = this.query.where('ratings').gte(parseFloat(queryObj.rating));
      delete queryObj.rating;
    }

    // Stock availability
    if (queryObj.inStock === 'true') {
      this.query = this.query.where('stock').gt(0);
      delete queryObj.inStock;
    }

    // Discount filter
    if (queryObj.onSale === 'true') {
      this.query = this.query.where('discountPrice').gt(0);
      delete queryObj.onSale;
    }

    // Always show active products
    this.query = this.query.where('isActive').equals(true);

    // Process remaining numeric filters with gte/lte
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // Sort results
  sort() {
    if (this.queryString.sort) {
      const sortMap = {
        'price-asc': 'price',
        'price-desc': '-price',
        'rating-desc': '-ratings',
        'newest': '-createdAt',
        'best-selling': '-numReviews',
      };
      const sortBy = sortMap[this.queryString.sort] || this.queryString.sort.split(',').join(' ') || '-createdAt';
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Paginate
  async paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 12, 50);
    const skip = (page - 1) * limit;

    // Count total documents (clone the query)
    this.totalCount = await this.query.model.countDocuments(this.query.getFilter());

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = {
      page,
      limit,
      totalPages: Math.ceil(this.totalCount / limit),
      totalCount: this.totalCount,
      hasNextPage: page < Math.ceil(this.totalCount / limit),
      hasPrevPage: page > 1,
    };

    return this;
  }
}

module.exports = APIFeatures;
