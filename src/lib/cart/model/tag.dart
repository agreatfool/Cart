part of cart;

class CartTag extends Object implements Serializable {

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

class CartTagList extends Object implements Serializable {

  HashMap<String, CartTag> list = {};
  HashMap<String, List<String>> tagPosts = {};


  CartTagList(String path, CartPostList postList) {
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

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_TAGS_PATH, toJson());
  }

}