chain( [fn1, a, b]
     , [obj, "method", x, y, z]
     , function (cb) { doSomething(1,2,3,cb) }
     , cb
     )
