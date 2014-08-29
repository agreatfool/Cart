part of cart;

class CartPost extends Object implements Serializable {

  String uuid;
  String driveId; // id of google drive

  String title;
  String link;
  int created;
  int updated;
  String author;

  String category; // uuid
  List<String> tags; // [uuid, uuid, ...]
  List<String> attachments; // ["filename", "filename", ...]

  CartPost.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    }
    if (json.containsKey('driveId')) {
      uuid = json['driveId'];
    }
    if (json.containsKey('title')) {
      uuid = json['title'];
    }
    if (json.containsKey('link')) {
      uuid = json['link'];
    }
    if (json.containsKey('created')) {
      uuid = json['created'];
    }
    if (json.containsKey('updated')) {
      uuid = json['updated'];
    }
    if (json.containsKey('author')) {
      uuid = json['author'];
    }
    if (json.containsKey('category')) {
      uuid = json['category'];
    }
    if (json.containsKey('tags')) {
      uuid = json['tags'];
    }
    if (json.containsKey('attachments')) {
      uuid = json['attachments'];
    }
  }

}

class CartPostList extends Object implements Serializable {

  HashMap<String, CartPost> list = {};

  List<String> postsOrderByCreated = []; // [uuid, ...]
  List<String> postsOrderByUpdated = []; // [uuid, ...]

  CartPostList(String path) {
    HashMap posts = PinUtility.readJsonFileSync(CartConst.DB_POSTS_PATH);

    if (posts.length > 0) {
      posts.forEach((String uuid, HashMap json) {
        var post = new CartPost.fromJson(json);
        list.addAll({uuid: post});
      });

      postsOrderByCreated = posts.keys.toList()..sort(_sortPostByCreated);
      postsOrderByUpdated = posts.keys.toList()..sort(_sortPostByUpdated);
    }
  }

  CartPost find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void save(CartPost post) {
    list[post.uuid] = post;
  }

  void pushPostToEndOfCreatedList(CartPost post) {
    if (postsOrderByCreated.contains(post.uuid)) {
      postsOrderByCreated.remove(post.uuid);
    }
    postsOrderByCreated.add(post.uuid);
  }

  void pushPostToEndOfUpdatedList(CartPost post) {
    if (postsOrderByUpdated.contains(post.uuid)) {
      postsOrderByUpdated.remove(post.uuid);
    }
    postsOrderByUpdated.add(post.uuid);
  }

  int _sortPostByCreated(String uuidA, String uuidB) {
    return _sortPostByProperty('created', uuidA, uuidB);
  }

  int _sortPostByUpdated(String uuidA, String uuidB) {
    return _sortPostByProperty('updated', uuidA, uuidB);
  }

  int _sortPostByProperty(String propertyName, String uuidA, String uuidB) {
    HashMap postA = list[uuidA];
    HashMap postB = list[uuidB];

    if (postA[propertyName] == postB[propertyName]) {
      return 0;
    } else if (postA[propertyName] > postB[propertyName]) {
      return -1; // sort: DESC
    } else {
      return 1;
    }
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_POSTS_PATH, toJson());
  }

}

class CartPostHeader {

  String title;
  String link;
  String category; //uuid
  List<HashMap<String, String>> tags; // [{"uuid": uuid, "name": string}, ...]
  List<String> attachments; // ["filename", "filename", ...]

  static CartPostHeader parseFromMarkdown(String markdown) {
    // TODO
  }

}

class CartPostHeaders {

}