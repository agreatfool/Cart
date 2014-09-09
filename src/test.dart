import 'dart:io';
import 'dart:async';
import 'dart:convert';

import 'package:stack_trace/stack_trace.dart' as LibTrace;

main() {

  Future doItLater() {
    return new Future.value('doItLater');
  }

  Future doItWithError() {
    try {
      throw new Exception('error!!!');
    } catch (e, trace) {
      return new Future.error(e, trace);
    }
    return new Future.value('doItWithError');
  }

  void handleError(e, trace) {
    print(e);
    if (trace != null) {
      print(trace);
    }
  }

    doItLater().then((_) {
      print(_);
      return doItWithError().then((_) {
        print('finally done: ${_}');
      });
    }).catchError(handleError);

}