import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:stack_trace/stack_trace.dart' as LibTrace;

main() {

  Future doItLater() {
    var e = new Exception('error!!!');
//    throw e;
//    return new Future.value(123);
//    return new Future.value(e);
    return new Future.error(e);
  }

  void handleError(e) {
    print(e);
  }

  try {
    doItLater().then((_) {
      throw 'another error!!!';
      print('normal end');
    }
//    , onError: (e) {
//      print('Error: ');
//      print(e);
//    }
    ).catchError(handleError);
//    (new File('/Users/jonathan/Downloads/dummy.txt')).readAsString()
//    .then((_) {
//      print('done');
//    })
//    .catchError(handleError);
  } catch (e) {
    print('catch outside');
    print(e);
  }

}