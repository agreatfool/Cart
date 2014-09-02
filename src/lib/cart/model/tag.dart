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
    }
    if (json.containsKey('driveId')) {
      uuid = json['driveId'];
    }
    if (json.containsKey('title')) {
      uuid = json['title'];
    }
    if (json.containsKey('created')) {
      uuid = json['created'];
    }
    if (json.containsKey('updated')) {
      uuid = json['updated'];
    }
  }

}

class CartTagList extends Object with PinSerializable {

  HashMap<String, CartTag> list = {};
  HashMap<String, List<String>> tagPosts = {}; // {tagUuid: [postUuid, postUuid, ...], ...}

  CartTagList(CartPostList postList) {
    HashMap tags = PinUtility.readJsonFileSync(CartConst.DB_TAGS_PATH);

    if (tags.length > 0) {
      tags.forEach((String uuid, HashMap json) {
        var tag = new CartTag.fromJson(json);
        list.addAll({uuid: tag});
      });

      if (postList.list.length > 0) {
        postList.postsOrderByCreated.forEach((postUuid) {
          CartPost post = postList.find(postUuid);
          List<String> tagsUuid = post.tags;

          // tag
          if (tagsUuid.length > 0) {
            tagsUuid.forEach((tagUuid) {
              if (!tagPosts.containsKey(tagUuid)) {
                tagPosts[tagUuid] = [postUuid];
              } else {
                tagPosts[tagUuid].add(postUuid);
              }
            });
          }
        });
      }
    }
  }

  CartTag find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void add(CartTag tag) {
    update(tag);
  }

  void update(CartTag tag) {
    list[tag.uuid] = tag;
  }

  void remove(String uuid, CartPostList postList) {
    if (!list.containsKey(uuid)) {
      return;
    }
    // tag
    list.remove(uuid);
    tagPosts.remove(uuid);
    // posts
    postList.list.forEach((String postUuid, CartPost post) {
      post.tags.remove(uuid);
    });
  }

  void addPostIntoTag(String uuid, String postUuid) {
    if (tagPosts.containsKey(uuid)) {
      tagPosts[uuid].add(postUuid);
    }
  }

  void removePostFromTag(String uuid, String postUuid) {
    if (tagPosts.containsKey(uuid)) {
      tagPosts[uuid].remove(postUuid);
    }
  }

  void updateTagsWhenAddPost(
      List<HashMap<String, String>> tagsUuid,
      {int timestamp: null, isAddPostAction: false, String postUuid: ''}
  ) {
    if (tagsUuid.length <= 0) {
      return;
    }
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }

    tagsUuid.forEach((HashMap<String, String> tagData) {
      var tag = find(tagData['uuid']);
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
      if (isAddPostAction) {
        tagPosts[tag.uuid].add(postUuid);
      }
    });
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_TAGS_PATH, toJson());
  }

}