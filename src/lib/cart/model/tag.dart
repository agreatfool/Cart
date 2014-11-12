part of cart;

class CartTag extends Object with PinSerializable {

  String uuid;
  String driveId;

  String title;
  int created;
  int updated;

  CartTag.fromJson(HashMap<String, dynamic> json) {
    if (json.containsKey('uuid')) {
      uuid = json['uuid'];
    } else {
      throw new Exception('[CartTag] CartTag.fromJson: "uuid" is required!');
    }
    if (json.containsKey('driveId')) {
      driveId = json['driveId'];
    }
    if (json.containsKey('title')) {
      title = json['title'];
    } else {
      throw new Exception('[CartTag] CartTag.fromJson: "title" is required!');
    }
    if (json.containsKey('created')) {
      created = json['created'];
    } else {
      throw new Exception('[CartTag] CartTag.fromJson: "created" is required!');
    }
    if (json.containsKey('updated')) {
      updated = json['updated'];
    } else {
      throw new Exception('[CartTag] CartTag.fromJson: "updated" is required!');
    }
  }

}

class CartTagList extends Object with PinSerializable {

  HashMap<String, CartTag> list = {};

  CartTagList(CartPostList postList) {
    HashMap tags = PinUtility.readJsonFileSync(CartConst.DB_TAGS_PATH);

    if (tags.length <= 0) {
      return;
    }
    tags.forEach((String uuid, HashMap json) {
      var tag = new CartTag.fromJson(json);
      list.addAll({uuid: tag});
    });
  }

  CartTag find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  CartTag findByTitle(String title) {
    CartTag found = null;
    for (String uuid in list.keys) {
      CartTag tag = list[uuid];
      if (tag.title == title) {
        found = tag;
        break;
      }
    }
    return found;
  }

  CartTag addNewTag(String uuid, String name, {int timestamp: null}) {
    if (list.containsKey(uuid)) {
      throw new Exception('[CartTagList] addNewTag: Duplicate tag uuid: ${uuid}!');
    }
    CartTag titleFound = findByTitle(name);
    if (titleFound != null) {
      throw new Exception('[CartTagList] addNewTag: Duplicate tag name: ${name}!');
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var tag = new CartTag.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    return add(tag);
  }

  CartTag add(CartTag tag) {
    if (!list.containsKey(tag.uuid)) {
      list[tag.uuid] = tag;
    }
    return tag;
  }

  void update(CartTag tag) {
    if (!list.containsKey(tag.uuid)) {
      return;
    }
    list[tag.uuid] = tag;
  }

  void remove(String uuid, CartPostList postList) {
    if (!list.containsKey(uuid)) {
      return;
    }
    // tag
    list.remove(uuid);
    // posts
    postList.list.forEach((String postUuid, CartPost post) {
      post.tags.remove(uuid);
    });
  }

  void updateTagsWhenAddPost(List<HashMap<String, String>> tagsUuid, {int timestamp: null}) {
    if (tagsUuid.length <= 0) {
      return;
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }

    tagsUuid.forEach((HashMap<String, String> tagData) {
      CartTag tag = find(tagData['uuid']);
      if (tag != null) {
        tag.updated = timestamp;
        update(tag);
      } else {
        tag = new CartTag.fromJson({
          "uuid": tagData['uuid'],
          "title": tagData['name'],
          "created": timestamp,
          "updated": timestamp
        });
        add(tag);
      }
    });
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_TAGS_PATH, toJson()['list'], withIndent: true);
  }

}