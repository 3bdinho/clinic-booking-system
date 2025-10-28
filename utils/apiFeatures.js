class ApiFeatures {
  constructor(mongooseQuery, queryStr) {
    this.mongooseQuery = mongooseQuery;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
    excludesFields.forEach((field) => delete queryObj[field]);

    // apply filter useing [gte|gt|lte|lt]
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }

    return this;
  }
  select() {
    if (this.queryStr.fields) {
      const fieldBy = this.queryStr.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fieldBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }

  search() {
    const { keyword } = this.queryStr;
    if (!keyword) return this;

    field = "name";

    const keywordFilter = {
      $or: [{ [field]: { $regex: keyword, $options: "i" } }],
    };

    this.mongooseQuery = this.mongooseQuery.find(keywordFilter);

    return this;
  }

  pagination(countDocuments) {
    const limit = this.queryStr.limit || 10;
    const page = this.queryStr.page || 1;
    const skip = (page - 1) * limit;
    const endIndex = limit * page;

    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) pagination.next = page + 1;
    if (skip > 0) pagination.prev = page - 1;

    this.paginationResult = pagination;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
