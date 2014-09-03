part of cart;

class CartPost extends Object with PinSerializable {

  String uuid;
  String driveId; // id of google drive

  String title;
  String link;
  int created;
  int updated;
  String author;

  String category; // uuid
  List<String> tags; // [uuid, uuid, ...]
  HashMap<String, CartPostAttachment> attachments;

  CartPost.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    }
    if (json.containsKey('link')) {
      link = json['link'];
    }
    if (json.containsKey('created')) {
      created = json['created'];
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    }
    if (json.containsKey('author')) {
      author = json['author'];
    }
    if (json.containsKey('category')) {
      category = json['category'];
    }
    if (json.containsKey('tags')) {
      tags = json['tags'];
    }
    if (json.containsKey('attachments')) {
      attachments = json['attachments'];
    }
  }

  void addTagUuid(String uuid) {
    tags.add(uuid);
  }

  void addAttachment(CartPostAttachment attachment) {
    attachments.addAll({ attachment.uuid: attachment });
  }

  void updateAttachment(CartPostAttachment attachment) {
    if (attachments.containsKey(attachment.uuid)) {
      attachments[attachment.uuid] = attachment;
    }
  }

  CartPostAttachment findAttachment(String uuid) {
    if (attachments.containsKey(uuid)) {
      return attachments[uuid];
    } else {
      return null;
    }
  }

}

class CartPostList extends Object with PinSerializable {

  HashMap<String, CartPost> list = {};

  List<String> postsOrderByCreated = []; // [uuid, ...]
  List<String> postsOrderByUpdated = []; // [uuid, ...]

  CartPostList() {
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

  void add(CartPost post) {
    list[post.uuid] = post;
    _pushPostToEndOfCreatedList(post);
    _pushPostToEndOfUpdatedList(post);
  }

  void update(CartPost post) {
    list[post.uuid] = post;
    _pushPostToEndOfUpdatedList(post);
  }

  void remove(String uuid) {
    if (!list.containsKey(uuid)) {
      return;
    }
    list.remove(uuid);
    postsOrderByCreated.remove(uuid);
    postsOrderByUpdated.remove(uuid);
  }

  void _pushPostToEndOfCreatedList(CartPost post) {
    if (postsOrderByCreated.contains(post.uuid)) {
      postsOrderByCreated.remove(post.uuid);
    }
    postsOrderByCreated.add(post.uuid);
  }

  void _pushPostToEndOfUpdatedList(CartPost post) {
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

class CartPostAttachment extends Object with PinSerializable {
  String uuid;
  String driveId; // id of google drive

  String title; // attachment file name
  int created;
  int updated;

  CartPostAttachment.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    }
    if (json.containsKey('created')) {
      created = json['created'];
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    }
  }
}

class CartPostHeader {

  String title;
  String link;
  String category; //uuid
  List<HashMap<String, String>> tags; // [{"uuid": uuid, "name": string}, ...]
  List<HashMap<String, String>> attachments; // [{"uuid": uuid, "name": string}, ...]

  bool valid = false;

  CartPostHeader.fromMarkdown(String markdown) {
    // TODO
  }

}