part of cart;

class CartCategory extends Object implements Serializable {

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

class CartCategoryList extends Object implements Serializable {

  HashMap<String, CartCategory> list = {};
  HashMap<String, List<String>> categoryPosts = {}; // {categoryUuid: [postUuid, postUuid, ...], ...}

  CartCategoryList(CartPostList postList) {
    HashMap categories = PinUtility.readJsonFileSync(CartConst.DB_CATEGORIES_PATH);

    if (categories.length > 0) {
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
  }

  CartCategory find(String uuid) {
    if (list.containsKey(uuid)) {
      return list[uuid];
    } else {
      return null;
    }
  }

  void add(CartCategory category) {
    update(category);
  }

  void update(CartCategory category) {
    list[category.uuid] = category;
  }

  List<String> remove(String uuid, CartPostList postList) {
    if (!list.containsKey(uuid)) {
      return;
    }
    var postRemoveUuidList = getPostListViaCategory(uuid);
    // category
    list.remove(uuid);
    categoryPosts.remove(uuid);
    // posts
    postRemoveUuidList.forEach((String postUuid) {
      postList.remove(postList);
    });

    return postRemoveUuidList;
  }

  List<String> getPostListViaCategory(String uuid) {
    return categoryPosts[uuid];
  }

  void switchPostCategory(String fromCategoryUuid, String toCategoryUuid, String postUuid) {
    removePostFromCategory(fromCategoryUuid, postUuid);
    addPostIntoCategory(toCategoryUuid, postUuid);
  }

  void addPostIntoCategory(String uuid, String postUuid) {
    if (categoryPosts.containsKey(uuid)) {
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