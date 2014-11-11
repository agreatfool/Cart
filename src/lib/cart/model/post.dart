part of cart;

class CartPost extends Object with PinSerializable {

  String uuid;
  String driveId; // id of google drive

  String title;
  int created;
  int updated;
  bool isPublic = false;

  String category; // uuid
  List<String> tags; // [uuid, uuid, ...]
  HashMap<String, CartPostAttachment> attachments;

  CartPost.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "uuid" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "driveId" is required!');
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "updated" is required!');
    }
    if (json.containsKey('isPublic')) {
      isPublic = json['isPublic'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "isPublic" is required!');
    }
    if (json.containsKey('category')) {
      category = json['category'];
    } else {
      throw new Exception('[CartPost] CartPost.fromJson: "category" is required!');
    }
    if (json.containsKey('tags')) {
      tags = json['tags'];
    }
    if (json.containsKey('attachments') && json['attachments'] is Iterable) {
      json['attachments'].forEach((HashMap attachData) {
        CartPostAttachment attachment = new CartPostAttachment.fromJson(attachData);
        attachments.addAll({ attachment.uuid: attachment });
      });
    }
  }

  void addTagUuid(String uuid) {
    if (tags.contains(uuid)) {
      return;
    }
    tags.add(uuid);
  }

  void removeTagUuid(String uuid) {
    tags.remove(uuid);
  }

  void addNewAttachment(String uuid, String name, {int timestamp: null}) {
    if (attachments.containsKey(uuid)) {
      return;
    }
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
    if (attachments.containsKey(uuid)) {
      return;
    }
    attachments.addAll({ attachment.uuid: attachment });
  }

  void updateAttachment(CartPostAttachment attachment) {
    if (!attachments.containsKey(attachment.uuid)) {
      return;
    }
    attachments[attachment.uuid] = attachment;
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

    // filter
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

    // action
    tagsToBeRemoved.forEach((String tagUuid) {
      removeTagUuid(tagUuid);
    });
    tagsToBeAdded.forEach((String tagUuid) {
      addTagUuid(tagUuid);
      List tagDatas = header.tags.where((HashMap<String, String> tagData) {
        if (tagData['uuid'] == tagUuid) { // find tagData of the tag added with tagUuid
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

    // filter
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

    // action
    attsToBeRemoved.forEach((String attUuid) {
      CartPostAttachment attachment = findAttachment(attUuid);
      removeAttachment(attachment);
      CartSystem.instance.drive.drive_trash(attachment.driveId); // delete it without listening to the results
      (new File(LibPath.join(CartConst.WWW_POST_PUB_PATH, uuid, attachment.title))).delete(); // also delete local files
    });
    attsToBeAdded.forEach((String attUuid) {
      List attDatas = header.attachments.where((HashMap<String, String> attData) {
        if (attData['uuid'] == attUuid) { // find attData of the attachment added with attUuid
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

  CartPostList() {
    HashMap posts = PinUtility.readJsonFileSync(CartConst.DB_POSTS_PATH);

    if (posts.length <= 0) {
      return;
    }
    posts.forEach((String uuid, HashMap json) {
      var post = new CartPost.fromJson(json);
      list.addAll({uuid: post});
    });
  }

  CartPost find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void add(CartPost post) {
    if (list.containsKey(post.uuid)) {
      return;
    }
    list[post.uuid] = post;
  }

  void update(CartPost post) {
    if (!list.containsKey(post.uuid)) {
      return;
    }
    list[post.uuid] = post;
  }

  void remove(String uuid) {
    list.remove(uuid);
  }

  void removePostsViaCategory(String categoryUuid) {
    if (list.length <= 0) {
      return;
    }
    list.forEach((String postUuid, CartPost post) {
      if (post.category == categoryUuid) {
        remove(postUuid);
      }
    });
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_POSTS_PATH, toJson()['list'], withIndent: true);
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
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "uuid" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "driveId" is required!');
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartPostAttachment] CartPostAttachment.fromJson: "updated" is required!');
    }
  }
}

class CartPostHeader {

  String title;
  String category; //uuid
  List<HashMap<String, String>> tags; // [{"uuid": uuid, "name": string}, ...]
  List<HashMap<String, String>> attachments; // [{"uuid": uuid, "name": string}, ...]

  bool isPublic = false;

  static CartPostHeader parseFromMarkdown(String markdown) {
    // TODO return null, if format is invalid
  }

}