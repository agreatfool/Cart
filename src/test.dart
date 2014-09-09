import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:stack_trace/stack_trace.dart' as LibTrace;

main() {

  Future doItLater() {
    var e = new Exception('error!!!');
    throw e;
    return new Future.value(123);
//    return new Future.value(e);
  }

  void handleError(e) {
    print(e);
  }

  try {
    doItLater().then((_) {
      print('normal end');
    }, onError: (e) {
      print('Error: ');
      print(e);
    }).catchError(handleError);
  } catch (e) {
    print('catch outside');
    print(e);
  }



}