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
   *   "tags": [uuid, uuid, ...],
   *   "attachments": ["filename", "filename", ...]
   * }
   * posts:
   * {
   *   uuid: post, ...
   * }
   * headers:
   * {
   *   "title": string,
   *   "link": string,
   *   "category": uuid, // category is created beforehand, so just uuid is enough
   *   "tags": [{"uuid": uuid, "name": string}, ...] // tag can be created when post saving, so name is necessary here for creating
   *   "attachments": ["filename", "filename", ...] // parsed from markdown code, not provided from client
   * }
   */
  HashMap<String, HashMap<String, dynamic>> posts = {};
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
  HashMap<String, HashMap<String, dynamic>> categories = {};
  HashMap<String, List<String>> categoryPosts = {};

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
  HashMap<String, HashMap<String, dynamic>> tags = {};
  HashMap<String, List<String>> tagPosts = {};

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* INIT
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  CartModel() {
    posts = PinUtility.readJsonFileSync(CartConst.DB_POSTS_PATH);
    categories = PinUtility.readJsonFileSync(CartConst.DB_CATEGORIES_PATH);
    tags = PinUtility.readJsonFileSync(CartConst.DB_TAGS_PATH);

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
    HashMap postA = posts[uuidA];
    HashMap postB = posts[uuidB];

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
      HashMap post = posts[postUuid];
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

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: POST
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future savePost(String uuid, String markdown) {
    // validate uuid
    if (!PinUtility.isUuid(uuid)) {
      PinLogger.instance.shout('[CartModel] savePost: uuid format invalid: ${uuid}}');
      return new Future(null);
    }

    // parse headers
    HashMap headers = _parsePostHeader(markdown);
    if (headers == null) {
      return new Future(null); // invalid headers format
    }

    // parse markdown to html & escape html
    String html = markdownToHtml(markdown);
    html = (const HtmlEscape()).convert(html);

    if (posts.containsKey(uuid)) {
      // update
      return _updatePost(uuid, markdown, headers, html);
    } else {
      // add
      return _addPost(uuid, markdown, headers, html);
    }
  }

  Future removePost(String uuid) {

  }

  Future _addPost(String uuid, String markdown, HashMap headers, String html) {
    int timestamp = PinTime.getTime();

    HashMap post = {
      'title': headers['title'],
      'link': headers['link'],
      'created': timestamp,
      'updated': timestamp,
      'author': CartSystem.instance.credentials['name'],
      'category': headers['category'],
      'tags': headers['tags'],
      'attachments': headers['attachments']
    };

    // database: post
    posts[uuid] = post;
    _pushPostToEndOfCreatedList(uuid);
    _pushPostToEndOfUpdatedList(uuid);

    // database: category
    _updateCategory(headers['category'], timestamp, isAddPost: true, postUuid: uuid);

    // database: tag
    _updateTags(headers['tags'], timestamp, isAddPost: true, postUuid: uuid);

    // TODO save db files & sync with google drive
  }

  Future _updatePost(String uuid, String markdown, HashMap headers, String html) {
    int timestamp = PinTime.getTime();

    HashMap post = {
        'title': headers['title'],
        'link': headers['link'],
        'updated': timestamp,
        'category': headers['category'],
        'tags': headers['tags'],
        'attachments': headers['attachments']
    };

    // TODO
    // FIXME 和add的逻辑近似？继续抽取相同逻辑出来
    posts[uuid] = post;
    _pushPostToEndOfCreatedList(uuid);
    _pushPostToEndOfUpdatedList(uuid);
  }

  HashMap _parsePostHeader(String markdown) {
    // FIXME 检查头格式是否正确，不正确返回null
    // attachments这个字段是从markdown内容中，分析![](...)格式分析出来的，不是直接写在markdown里的
    return {};
  }

  void _pushPostToEndOfCreatedList(String uuid) {
    if (postsOrderByCreated.contains(uuid)) {
      postsOrderByCreated.remove(uuid);
    }
    postsOrderByCreated.add(uuid);
  }

  void _pushPostToEndOfUpdatedList(String uuid) {
    if (postsOrderByUpdated.contains(uuid)) {
      postsOrderByUpdated.remove(uuid);
    }
    postsOrderByUpdated.add(uuid);
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: CATEGORY
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addCategory(String uuid, String name) {

  }

  Future removeCategory(String uuid) {

  }

  void _updateCategory(String uuid, int updatedTime, {bool isAddPost: false, String postUuid: ''}) {
    categories[uuid]['updated'] = updatedTime;
    if (isAddPost) {
      _pushPostToEndOfCategoryList(uuid, postUuid);
    }
  }

  void _pushPostToEndOfCategoryList(String uuid, String postUuid) {
    if (categoryPosts[uuid].contains(postUuid)) {
      categoryPosts[uuid].remove(postUuid);
    }
    categoryPosts[uuid].add(postUuid);
  }

  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  //-* API: TAG
  //-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
  Future addTag(String uuid, String name, {int timestamp: null, bool fileSyncImmediately: false}) {
    final completer = new Completer();

    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }

    tags.addAll({
      uuid: {
        'title': name,
        'created': timestamp,
        'updated': timestamp
      }
    });

    if (fileSyncImmediately) {
      PinUtility.writeJsonFile(CartConst.DB_TAGS_PATH, tags)
        .then((_) => completer.complete(null));
    } else {
      completer.complete(null);
    }

    return completer.future;
  }

  Future removeTag(String uuid, {bool fileSyncImmediately: false}) {
    final completer = new Completer();

    if (tags.containsKey(uuid)) {
      tags.remove(uuid);
      tagPosts.remove(uuid);
      // posts
      posts.forEach((String postUuid, HashMap post) {
        List<String> postTags = post['tags'];
        if (postTags.contains(uuid)) {
          postTags.remove(uuid);
          postsOrderByCreated.remove(uuid);
          postsOrderByUpdated.remove(uuid);
        }
      });
      if (fileSyncImmediately) {
        PinUtility.writeJsonFile(CartConst.DB_TAGS_PATH, tags)
          .then((_) => PinUtility.writeJsonFile(CartConst.DB_POSTS_PATH, posts))
          .then((_) => completer.complete(null));
      }
    } else {
      completer.complete(null);
    }

    return completer.future;
  }

  void _updateTags(List<HashMap> headerTags, int timestamp, {isAddPost: false, String postUuid: ''}) {
    // headerTags: [ { "uuid": uuid, "name": string }, ... ]
    if (headerTags.length > 0) {
      if (timestamp == null) {
        timestamp = PinTime.getTime();
      }
      headerTags.forEach((HashMap tagData) {
        if (tags.containsKey(tagData['uuid'])) {
          _updateTag(tagData['uuid'], timestamp);
        } else {
          addTag(tagData['uuid'], tagData['name']);
        }
        if (isAddPost) {
          _pushPostToEndOfTagList(tagData['uuid'], postUuid);
        }
      });
    }
  }

  void _updateTag(String uuid, int updatedTime) {
    tags[uuid]['updated'] = updatedTime;
  }

  void _pushPostToEndOfTagList(String uuid, String postUuid) {
    if (tagPosts[uuid].contains(postUuid)) {
      tagPosts[uuid].remove(postUuid);
    }
    tagPosts[uuid].add(postUuid);
  }

}