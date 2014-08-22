import 'dart:io';
import 'dart:convert';

main() {

  Map<String, Map<String, dynamic>> posts = //{};
  {
    "postId1": {
      "created": 1,
      "updated": 2,
      "category": "category1",
      "tags": [
        "tag1", "tag2", "tag3"
      ]
    },
    "postId2": {
      "created": 2,
      "updated": 12,
      "category": "category2",
      "tags": [
        "tag4", "tag5", "tag6"
      ]
    },
    "postId3": {
        "created": 3,
        "updated": 5,
        "category": "category2",
        "tags": [
            "tag4", "tag5", "tag6"
        ]
    },
    "postId4": {
        "created": 4,
        "updated": 4,
        "category": "category2",
        "tags": [
            "tag4", "tag5", "tag6"
        ]
    }
  };

  int _sortPostByProperty(String propertyName, String uuidA, String uuidB) {
    Map postA = posts[uuidA];
    Map postB = posts[uuidB];
    if (postA[propertyName] == postB[propertyName]) {
      return 0;
    } else if (postA[propertyName] > postB[propertyName]) {
      return -1;
    } else {
      return 1;
    }
  }

  int _sortPostByCreated(String uuidA, String uuidB) {
    return _sortPostByProperty('created', uuidA, uuidB);
  }

  int _sortPostByUpdated(String uuidA, String uuidB) {
    return _sortPostByProperty('updated', uuidA, uuidB);
  }

  var postsOrderByCreated = posts.keys.toList()..sort(_sortPostByCreated);
  var postsOrderByUpdated = posts.keys.toList()..sort(_sortPostByUpdated);

  Map<String, List<String>> categoryPosts = {};
  Map<String, List<String>> tagPosts = {};

  void _buildCategoryAndTagPostsList() {
    if (postsOrderByCreated.length <= 0) {
      return; // no need to run
    }
    postsOrderByCreated.forEach((postUuid) {
      Map post = posts[postUuid];
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

  print(postsOrderByUpdated);
  print(postsOrderByCreated);
  _buildCategoryAndTagPostsList();
  print(categoryPosts);
  print(tagPosts);


}