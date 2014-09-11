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

  void removeTagUuid(String uuid) {
    tags.remove(uuid);
  }

  void addNewAttachment(String uuid, String name, {int timestamp: null}) {
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var attachment = new CartPostAttachment.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    addAttachment(attachment);
  }

  void addAttachment(CartPostAttachment attachment) {
    attachments.addAll({ attachment.uuid: attachment });
  }

  void updateAttachment(CartPostAttachment attachment) {
    if (attachments.containsKey(attachment.uuid)) {
      attachments[attachment.uuid] = attachment;
    }
  }

  void removeAttachment(CartPostAttachment attachment) {
    attachments.remove(attachment.uuid);
  }

  CartPostAttachment findAttachment(String uuid) {
    if (attachments.containsKey(uuid)) {
      return attachments[uuid];
    } else {
      return null;
    }
  }

  void checkPostTagsChange(CartTagList tagList, CartPostHeader header) {
    var tagsToBeRemoved = new List<String>();
    var tagsToBeAdded = new List<String>();

    tags.forEach((String tagUuid) {
      var tagFound = false;
      header.tags.forEach((HashMap<String, String> tagData) {
        if (tagData['uuid'] == tagUuid) {
          tagFound = true;
        }
      });
      if (!tagFound) {
        // old tag no longer exists in the post
        tagsToBeRemoved.add(tagUuid);
      }
    });
    header.tags.forEach((HashMap<String, String> tagData) {
      var tagFound = false;
      tags.forEach((String tagUuid) {
        if (tagData['uuid'] == tagUuid) {
          tagFound = true;
        }
      });
      if (!tagFound) {
        // new tag does not exist in the post
        tagsToBeAdded.add(tagData['uuid']);
      }
    });
    tagsToBeRemoved.forEach((String tagUuid) {
      removeTagUuid(tagUuid);
      tagList.removePostFromTag(tagUuid, uuid);
    });
    tagsToBeAdded.forEach((String tagUuid) {
      addTagUuid(tagUuid);
      tagList.addPostIntoTag(tagUuid, uuid);
      List tagDatas = header.tags.where((HashMap<String, String> tagData) {
        if (tagData['uuid'] == tagUuid) {
          return true;
        } else {
          return false;
        }
      });
      String tagName = tagDatas.removeAt(0)['name'];
      tagList.addNewTag(tagUuid, tagName);
    });
  }

  HashMap<String, Future> checkPostAttachmentsChange(CartPostHeader header) {
    var attsToBeRemoved = new List<String>();
    var attsToBeAdded = new List<String>();
    var processFutures = new HashMap<String, Future>();

    attachments.forEach((String attUuid, CartPostAttachment attachment) {
      var attFound = false;
      header.attachments.forEach((HashMap<String, String> attData) {
        if (attData['uuid'] == attUuid) {
          attFound = true;
        }
      });
      if (!attFound) {
        // old attachment no longer exists in the post
        attsToBeRemoved.add(attUuid);
      }
    });
    header.attachments.forEach((HashMap<String, String> attData) {
      var attFound = false;
      attachments.forEach((String attUuid, CartPostAttachment attachment) {
        if (attData['uuid'] == attUuid) {
          attFound = true;
        }
      });
      if (!attFound) {
        // new attachment does not exist in the post
        attsToBeAdded.add(attData['uuid']);
      }
    });
    attsToBeRemoved.forEach((String attUuid) {
      CartPostAttachment attachment = findAttachment(attUuid);
      removeAttachment(attachment);
      CartSystem.instance.drive.drive_trash(attachment.driveId); // delete it without listening to the results
      (new File(LibPath.join(CartConst.WWW_POST_PUB_PATH, uuid, attachment.title))).delete(); // also delete local files
    });
    attsToBeAdded.forEach((String attUuid) {
      List attDatas = header.attachments.where((HashMap<String, String> attData) {
        if (attData['uuid'] == attUuid) {
          return true;
        } else {
          return false;
        }
      });
      String attName = attDatas.removeAt(0)['name'];
      addNewAttachment(attUuid, attName);
      processFutures.addAll({
          attUuid: CartSystem.instance.drive.uploadFile(LibPath.join(CartConst.WWW_POST_PUB_PATH, uuid, attName), parents: [category])
      });
    });

    return processFutures;
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

  void remove(String uuid, CartCategoryList categoryList, CartTagList tagList) { // FIXME
    if (!list.containsKey(uuid)) {
      return;
    }
    CartPost post = find(uuid);

    // posts
    list.remove(uuid);
    postsOrderByCreated.remove(uuid);
    postsOrderByUpdated.remove(uuid);

    // category
    categoryList.removePostFromCategory(post.category, post.uuid);

    // tags
    if (post.tags.length <= 0) {
      return;
    }
    post.tags.forEach((String tagUuid) {
      tagList.removePostFromTag(tagUuid, post.uuid);
    });
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

  static CartPostHeader parseFromMarkdown(String markdown) {
    // TODO
  }

}