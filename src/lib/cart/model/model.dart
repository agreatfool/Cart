part of cart;

class CartModel {

  static CartModel _model;

  static CartModel get instance {
    if (_model == null) {
      _model = new CartModel();
    }

    return _model;
  }

  CartModel() {
    _posts = PinUtility.readJsonFileSync('database/posts.json');
    _categories = PinUtility.readJsonFileSync('database/categories.json');
    _tags = PinUtility.readJsonFileSync('database/tags.json');
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* POSTS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  /**
   * post:
   * {
   *   "title": string,
   *   "link": string,
   *   "created": timestamp,
   *   "edited": timestamp,
   *   "author": string,
   *   "category": uuid,
   *   "tags": [uuid, uuid, ...]
   * }
   * posts:
   * {
   *   uuid: post, ...
   * }
   */
  Map<String, Map<String, dynamic>> _posts;

  Map<String, Map<String, dynamic>> get posts => _posts;
  set posts(Map<String, Map<String, dynamic>> postsMap) => _posts = postsMap;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* CATEGORIES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Map<String, Map<String, dynamic>> _categories;

  Map<String, Map<String, dynamic>> get categories => _categories;
  set categories(Map<String, Map<String, dynamic>> categoriesMap) => _categories = categoriesMap;

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* TAGS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Map<String, Map<String, dynamic>> _tags;

  Map<String, Map<String, dynamic>> get tags => _tags;
  set tags(Map<String, Map<String, dynamic>> tagsMap) => _tags = tagsMap;

}