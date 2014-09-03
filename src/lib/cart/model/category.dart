part of cart;

class CartCategory extends Object with PinSerializable {

  String uuid;
  String driveId;

  String title;
  int created;
  int updated;

  CartCategory.fromJson(HashMap<String, dynamic> json) {
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

class CartCategoryList extends Object with PinSerializable {

  HashMap<String, CartCategory> list = {};
  HashMap<String, List<String>> categoryPosts = {}; // {categoryUuid: [postUuid, postUuid, ...], ...}

  CartCategoryList(CartPostList postList) {
    HashMap categories = PinUtility.readJsonFileSync(CartConst.DB_CATEGORIES_PATH);

    if (categories.length <= 0) {
      return;
    }
    categories.forEach((String uuid, HashMap json) {
      var category = new CartCategory.fromJson(json);
      list.addAll({uuid: category});
    });

    if (postList.list.length > 0) {
      postList.postsOrderByCreated.forEach((postUuid) {
        CartPost post = postList.find(postUuid);
        String categoryUuid = post.category;

        // category
        if (!categoryPosts.containsKey(categoryUuid)) {
          categoryPosts[categoryUuid] = [postUuid];
        } else {
          categoryPosts[categoryUuid].add(postUuid);
        }
      });
    }
  }

  CartCategory find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void addNewCategory(String uuid, String name, {int timestamp: null}) {
    if (timestamp == null) {
      timestamp = PinTime.getTime();
    }
    var category = new CartCategoryList.fromJson({
        "uuid": uuid,
        "title": name,
        "created": timestamp,
        "updated": timestamp
    });
    add(category);
  }

  void add(CartCategory category) {
    if (!list.containsKey(category.uuid)) {
      update(category);
    }
  }

  void update(CartCategory category) {
    list[category.uuid] = category;
  }

  void remove(String uuid, CartPostList postList, CartTagList tagList) {
    if (!list.containsKey(uuid)) {
      return;
    }
    List<String> postRemoveUuidList = getPostListViaCategory(uuid);
    // category
    list.remove(uuid);
    categoryPosts.remove(uuid);
    // posts
    postRemoveUuidList.forEach((String postUuid) {
      CartPost post = postList.find(postUuid);
      post.tags.forEach((String tagUuid) {
        tagList.removePostFromTag(tagUuid, postUuid);
      });
      postList.remove(postUuid);
    });
  }

  List<String> getPostListViaCategory(String uuid) {
    return categoryPosts[uuid];
  }

  void switchPostCategory(String fromCategoryUuid, String toCategoryUuid, String postUuid) {
    removePostFromCategory(fromCategoryUuid, postUuid);
    addPostIntoCategory(toCategoryUuid, postUuid);
  }

  void addPostIntoCategory(String uuid, String postUuid) {
    if (categoryPosts.containsKey(uuid) && !categoryPosts[uuid].contains(postUuid)) {
      categoryPosts[uuid].add(postUuid);
    }
  }

  void removePostFromCategory(String uuid, String postUuid) {
    if (categoryPosts.containsKey(uuid)) {
      categoryPosts[uuid].remove(postUuid);
    }
  }

  Future<File> dump() {
    return PinUtility.writeJsonFile(CartConst.DB_CATEGORIES_PATH, toJson());
  }

}