part of cart;

class CartModel {

  static CartModel _model;

  static CartModel get instance {
    if (_model == null) {
      _model = new CartModel();
    }

    return _model;
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
   *   "updated": timestamp,
   *   "author": string,
   *   "category": uuid,
   *   "tags": [uuid, uuid, ...]
   * }
   * posts:
   * {
   *   uuid: post, ...
   * }
   */
  Map<String, Map<String, dynamic>> posts = {};
  List<String> postsOrderByCreated = [];
  List<String> postsOrderByUpdated = [];

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* CATEGORIES
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  /**
   * category:
   * {
   *   "title": string,
   *   "created": timestamp,
   *   "updated": timestamp
   * }
   * categories:
   * {
   *   uuid: category, ...
   * }
   * category posts:
   * {
   *   categoryUuid: [postUuid, postUuid, ...] // order by created time
   * }
   */
  Map<String, Map<String, dynamic>> categories = {};
  Map<String, List<String>> categoryPosts = {};

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* TAGS
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  /**
   * tag:
   * {
   *   "title": string,
   *   "created": timestamp,
   *   "updated": timestamp
   * }
   * tags:
   * {
   *   uuid: tag, ...
   * }
   * tag posts:
   * {
   *   tagUuid: [postUuid, postUuid, ...] // order by created time
   * }
   */
  Map<String, Map<String, dynamic>> tags = {};
  Map<String, List<String>> tagPosts = {};

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* INIT
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  CartModel() {
    posts = PinUtility.readJsonFileSync('database/posts.json');
    categories = PinUtility.readJsonFileSync('database/categories.json');
    tags = PinUtility.readJsonFileSync('database/tags.json');

    postsOrderByCreated = posts.keys.toList()..sort(_sortPostByCreated);
    postsOrderByUpdated = posts.keys.toList()..sort(_sortPostByUpdated);
    _buildCategoryAndTagPostsList();
  }

  int _sortPostByCreated(String uuidA, String uuidB) {
    return _sortPostByProperty('created', uuidA, uuidB);
  }

  int _sortPostByUpdated(String uuidA, String uuidB) {
    return _sortPostByProperty('updated', uuidA, uuidB);
  }

  int _sortPostByProperty(String propertyName, String uuidA, String uuidB) {
    Map postA = posts[uuidA];
    Map postB = posts[uuidB];

    if (postA[propertyName] == postB[propertyName]) {
      return 0;
    } else if (postA[propertyName] > postB[propertyName]) {
      return -1; // sort: DESC
    } else {
      return 1;
    }
  }

  void _buildCategoryAndTagPostsList() {
    if (postsOrderByCreated.length <= 0) {
      return; // no need to run
    }
    postsOrderByCreated.forEach((postUuid) {
      Map post = posts[postUuid];
      String categoryUuid = post['category'];
      List<String> tagsUuid = post['tags'];

      // category
      if (!categoryPosts.containsKey(categoryUuid)) {
        categoryPosts[categoryUuid] = [postUuid];
      } else {
        categoryPosts[categoryUuid].add(postUuid);
      }

      // tag
      tagsUuid.forEach((tagUuid) {
        if (!tagPosts.containsKey(tagUuid)) {
          tagPosts[tagUuid] = [postUuid];
        } else {
          tagPosts[tagUuid].add(postUuid);
        }
      });
    });
  }

}