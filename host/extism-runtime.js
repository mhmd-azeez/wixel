"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/allocator.ts
var Allocator = class {
  constructor(n) {
    this.currentIndex = BigInt(1);
    this.active = {};
    this.freed = [];
    this.memory = new Uint8Array(n);
  }
  reset() {
    this.currentIndex = BigInt(1);
    this.active = {};
    this.freed = [];
  }
  alloc(length) {
    for (var i = 0; i < this.freed.length; i++) {
      let block = this.freed[i];
      if (block.length === length) {
        this.active[Number(block.offset)] = block;
        this.freed.splice(i, 1);
        return block.offset;
      } else if (block.length > length + BigInt(64)) {
        const newBlock = { offset: block.offset, length };
        block.offset += length;
        block.length -= length;
        return newBlock.offset;
      }
    }
    if (BigInt(this.memory.length) < this.currentIndex + length) {
      const tmp = new Uint8Array(Number(this.currentIndex + length + BigInt(64)));
      tmp.set(this.memory);
      this.memory = tmp;
    }
    const offset = this.currentIndex;
    this.currentIndex += length;
    this.active[Number(offset)] = { offset, length };
    return offset;
  }
  getBytes(offset) {
    const block = this.active[Number(offset)];
    if (!block) {
      return null;
    }
    return new Uint8Array(this.memory.buffer, Number(offset), Number(block.length));
  }
  getString(offset) {
    const bytes = this.getBytes(offset);
    if (bytes === null) {
      return null;
    }
    return new TextDecoder().decode(bytes);
  }
  allocBytes(data) {
    const offs = this.alloc(BigInt(data.length));
    const bytes = this.getBytes(offs);
    if (bytes === null) {
      this.free(offs);
      return BigInt(0);
    }
    bytes.set(data);
    return offs;
  }
  allocString(data) {
    const bytes = new TextEncoder().encode(data);
    return this.allocBytes(bytes);
  }
  getLength(offset) {
    const block = this.active[Number(offset)];
    if (!block) {
      return BigInt(0);
    }
    return block.length;
  }
  free(offset) {
    const block = this.active[Number(offset)];
    if (!block) {
      return;
    }
    delete this.active[Number(offset)];
    this.freed.push(block);
  }
};

// node_modules/@bjorn3/browser_wasi_shim/dist/wasi_defs.js
var CLOCKID_REALTIME = 0;
var ERRNO_BADF = 8;
var RIGHTS_FD_DATASYNC = 1 << 0;
var RIGHTS_FD_READ = 1 << 1;
var RIGHTS_FD_SEEK = 1 << 2;
var RIGHTS_FD_FDSTAT_SET_FLAGS = 1 << 3;
var RIGHTS_FD_SYNC = 1 << 4;
var RIGHTS_FD_TELL = 1 << 5;
var RIGHTS_FD_WRITE = 1 << 6;
var RIGHTS_FD_ADVISE = 1 << 7;
var RIGHTS_FD_ALLOCATE = 1 << 8;
var RIGHTS_PATH_CREATE_DIRECTORY = 1 << 9;
var RIGHTS_PATH_CREATE_FILE = 1 << 10;
var RIGHTS_PATH_LINK_SOURCE = 1 << 11;
var RIGHTS_PATH_LINK_TARGET = 1 << 12;
var RIGHTS_PATH_OPEN = 1 << 13;
var RIGHTS_FD_READDIR = 1 << 14;
var RIGHTS_PATH_READLINK = 1 << 15;
var RIGHTS_PATH_RENAME_SOURCE = 1 << 16;
var RIGHTS_PATH_RENAME_TARGET = 1 << 17;
var RIGHTS_PATH_FILESTAT_GET = 1 << 18;
var RIGHTS_PATH_FILESTAT_SET_SIZE = 1 << 19;
var RIGHTS_PATH_FILESTAT_SET_TIMES = 1 << 20;
var RIGHTS_FD_FILESTAT_GET = 1 << 21;
var RIGHTS_FD_FILESTAT_SET_SIZE = 1 << 22;
var RIGHTS_FD_FILESTAT_SET_TIMES = 1 << 23;
var RIGHTS_PATH_SYMLINK = 1 << 24;
var RIGHTS_PATH_REMOVE_DIRECTORY = 1 << 25;
var RIGHTS_PATH_UNLINK_FILE = 1 << 26;
var RIGHTS_POLL_FD_READWRITE = 1 << 27;
var RIGHTS_SOCK_SHUTDOWN = 1 << 28;
var Iovec = class {
  static read_bytes(view, ptr) {
    let iovec = new Iovec();
    iovec.buf = view.getUint32(ptr, true);
    iovec.buf_len = view.getUint32(ptr + 4, true);
    return iovec;
  }
  static read_bytes_array(view, ptr, len) {
    let iovecs = [];
    for (let i = 0; i < len; i++) {
      iovecs.push(Iovec.read_bytes(view, ptr + 8 * i));
    }
    return iovecs;
  }
};
var Ciovec = class {
  static read_bytes(view, ptr) {
    let iovec = new Ciovec();
    iovec.buf = view.getUint32(ptr, true);
    iovec.buf_len = view.getUint32(ptr + 4, true);
    return iovec;
  }
  static read_bytes_array(view, ptr, len) {
    let iovecs = [];
    for (let i = 0; i < len; i++) {
      iovecs.push(Ciovec.read_bytes(view, ptr + 8 * i));
    }
    return iovecs;
  }
};
var FDFLAGS_APPEND = 1 << 0;
var FDFLAGS_DSYNC = 1 << 1;
var FDFLAGS_NONBLOCK = 1 << 2;
var FDFLAGS_RSYNC = 1 << 3;
var FDFLAGS_SYNC = 1 << 4;
var FSTFLAGS_ATIM = 1 << 0;
var FSTFLAGS_ATIM_NOW = 1 << 1;
var FSTFLAGS_MTIM = 1 << 2;
var FSTFLAGS_MTIM_NOW = 1 << 3;
var OFLAGS_CREAT = 1 << 0;
var OFLAGS_DIRECTORY = 1 << 1;
var OFLAGS_EXCL = 1 << 2;
var OFLAGS_TRUNC = 1 << 3;
var EVENTRWFLAGS_FD_READWRITE_HANGUP = 1 << 0;
var SUBCLOCKFLAGS_SUBSCRIPTION_CLOCK_ABSTIME = 1 << 0;
var RIFLAGS_RECV_PEEK = 1 << 0;
var RIFLAGS_RECV_WAITALL = 1 << 1;
var ROFLAGS_RECV_DATA_TRUNCATED = 1 << 0;
var SDFLAGS_RD = 1 << 0;
var SDFLAGS_WR = 1 << 1;

// node_modules/@bjorn3/browser_wasi_shim/dist/wasi.js
var WASI = class WASI2 {
  start(instance) {
    this.inst = instance;
    instance.exports._start();
  }
  initialize(instance) {
    this.inst = instance;
    instance.exports._initialize();
  }
  constructor(args, env, fds) {
    this.args = [];
    this.env = [];
    this.fds = [];
    this.args = args;
    this.env = env;
    this.fds = fds;
    let self = this;
    this.wasiImport = { args_sizes_get(argc, argv_buf_size) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      buffer.setUint32(argc, self.args.length, true);
      let buf_size = 0;
      for (let arg of self.args) {
        buf_size += arg.length + 1;
      }
      buffer.setUint32(argv_buf_size, buf_size, true);
      return 0;
    }, args_get(argv, argv_buf) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      let orig_argv_buf = argv_buf;
      for (let i = 0; i < self.args.length; i++) {
        buffer.setUint32(argv, argv_buf, true);
        argv += 4;
        let arg = new TextEncoder("utf-8").encode(self.args[i]);
        buffer8.set(arg, argv_buf);
        buffer.setUint8(argv_buf + arg.length, 0);
        argv_buf += arg.length + 1;
      }
      return 0;
    }, environ_sizes_get(environ_count, environ_size) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      buffer.setUint32(environ_count, self.env.length, true);
      let buf_size = 0;
      for (let environ of self.env) {
        buf_size += environ.length + 1;
      }
      buffer.setUint32(environ_size, buf_size, true);
      return 0;
    }, environ_get(environ, environ_buf) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      let orig_environ_buf = environ_buf;
      for (let i = 0; i < env.length; i++) {
        buffer.setUint32(environ, environ_buf, true);
        environ += 4;
        let e = new TextEncoder("utf-8").encode(env[i]);
        buffer8.set(e, environ_buf);
        buffer.setUint8(environ_buf + e.length, 0);
        environ_buf += e.length + 1;
      }
      return 0;
    }, clock_res_get(id, res_ptr) {
      throw "unimplemented";
    }, clock_time_get(id, precision, time) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      if (id === CLOCKID_REALTIME) {
        buffer.setBigUint64(time, BigInt(new Date().getTime()) * 1000000n, true);
      } else {
        buffer.setBigUint64(time, 0n, true);
      }
      return 0;
    }, fd_advise(fd, offset, len, advice) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_advise(offset, len, advice);
      } else {
        return ERRNO_BADF;
      }
    }, fd_allocate(fd, offset, len) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_allocate(offset, len);
      } else {
        return ERRNO_BADF;
      }
    }, fd_close(fd) {
      if (self.fds[fd] != void 0) {
        let ret = self.fds[fd].fd_close();
        self.fds[fd] = void 0;
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_datasync(fd) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_datasync();
      } else {
        return ERRNO_BADF;
      }
    }, fd_fdstat_get(fd, fdstat_ptr) {
      if (self.fds[fd] != void 0) {
        let { ret, fdstat } = self.fds[fd].fd_fdstat_get();
        if (fdstat != null) {
          fdstat.write_bytes(new DataView(self.inst.exports.memory.buffer), fdstat_ptr);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_fdstat_set_flags(fd, flags) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_fdstat_set_flags(flags);
      } else {
        return ERRNO_BADF;
      }
    }, fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_fdstat_set_rights(fs_rights_base, fs_rights_inheriting);
      } else {
        return ERRNO_BADF;
      }
    }, fd_filestat_get(fd, filestat_ptr) {
      if (self.fds[fd] != void 0) {
        let { ret, filestat } = self.fds[fd].fd_filestat_get();
        if (filestat != null) {
          filestat.write_bytes(new DataView(self.inst.exports.memory.buffer), filestat_ptr);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_filestat_set_size(fd, size) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_filestat_set_size(size);
      } else {
        return ERRNO_BADF;
      }
    }, fd_filestat_set_times(fd, atim, mtim, fst_flags) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_filestat_set_times(atim, mtim, fst_flags);
      } else {
        return ERRNO_BADF;
      }
    }, fd_pread(fd, iovs_ptr, iovs_len, offset, nread_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let iovecs = Iovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        let { ret, nread } = self.fds[fd].fd_pread(buffer8, iovecs, offset);
        buffer.setUint32(nread_ptr, nread, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_prestat_get(fd, buf_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let { ret, prestat } = self.fds[fd].fd_prestat_get();
        if (prestat != null) {
          prestat.write_bytes(buffer, buf_ptr);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_prestat_dir_name(fd, path_ptr, path_len) {
      if (self.fds[fd] != void 0) {
        let { ret, prestat_dir_name } = self.fds[fd].fd_prestat_dir_name();
        if (prestat_dir_name != null) {
          let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
          buffer8.set(prestat_dir_name, path_ptr);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_pwrite(fd, iovs_ptr, iovs_len, offset, nwritten_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let iovecs = Ciovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        let { ret, nwritten } = self.fds[fd].fd_pwrite(buffer8, iovecs, offset);
        buffer.setUint32(nwritten_ptr, nwritten, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_read(fd, iovs_ptr, iovs_len, nread_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let iovecs = Iovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        let { ret, nread } = self.fds[fd].fd_read(buffer8, iovecs);
        buffer.setUint32(nread_ptr, nread, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_readdir(fd, buf, buf_len, cookie, bufused_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let bufused = 0;
        while (true) {
          let { ret, dirent } = self.fds[fd].fd_readdir_single(cookie);
          if (ret != 0) {
            buffer.setUint32(bufused_ptr, bufused, true);
            return ret;
          }
          if (dirent == null) {
            break;
          }
          let offset = dirent.length();
          if (buf_len - bufused < offset) {
            break;
          }
          dirent.write_bytes(buffer, buffer8, buf);
          buf += offset;
          bufused += offset;
          cookie = dirent.d_next;
        }
        buffer.setUint32(bufused_ptr, bufused, true);
        return 0;
      } else {
        return ERRNO_BADF;
      }
    }, fd_renumber(fd, to) {
      if (self.fds[fd] != void 0 && self.fds[to] != void 0) {
        let ret = self.fds[to].fd_close();
        if (ret != 0) {
          return ret;
        }
        self.fds[to] = self.fds[fd];
        self.fds[fd] = void 0;
        return 0;
      } else {
        return ERRNO_BADF;
      }
    }, fd_seek(fd, offset, whence, offset_out_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let { ret, offset: offset_out } = self.fds[fd].fd_seek(offset, whence);
        buffer.setUint32(offset_out_ptr, offset, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_sync(fd) {
      if (self.fds[fd] != void 0) {
        return self.fds[fd].fd_sync();
      } else {
        return ERRNO_BADF;
      }
    }, fd_tell(fd, offset_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let { ret, offset } = self.fds[fd].fd_tell();
        buffer.setUint32(offset_ptr, offset, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, fd_write(fd, iovs_ptr, iovs_len, nwritten_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let iovecs = Ciovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        let { ret, nwritten } = self.fds[fd].fd_write(buffer8, iovecs);
        buffer.setUint32(nwritten_ptr, nwritten, true);
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, path_create_directory(fd, path_ptr, path_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        return self.fds[fd].path_create_directory(path);
      }
    }, path_filestat_get(fd, flags, path_ptr, path_len, filestat_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        let { ret, filestat } = self.fds[fd].path_filestat_get(flags, path);
        if (filestat != null) {
          filestat.write_bytes(buffer, filestat_ptr);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, path_filestat_set_times(fd, flags, path_ptr, path_len, atim, mtim, fst_flags) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        return self.fds[fd].path_filestat_set_times(flags, path, atim, mtim, fst_flags);
      } else {
        return ERRNO_BADF;
      }
    }, path_link(old_fd, old_flags, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[old_fd] != void 0 && self.fds[new_fd] != void 0) {
        let old_path = new TextDecoder("utf-8").decode(buffer8.slice(old_path_ptr, old_path_ptr + old_path_len));
        let new_path = new TextDecoder("utf-8").decode(buffer8.slice(new_path_ptr, new_path_ptr + new_path_len));
        return self.fds[new_fd].path_link(old_fd, old_flags, old_path, new_path);
      } else {
        return ERRNO_BADF;
      }
    }, path_open(fd, dirflags, path_ptr, path_len, oflags, fs_rights_base, fs_rights_inheriting, fd_flags, opened_fd_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        let { ret, fd_obj } = self.fds[fd].path_open(dirflags, path, oflags, fs_rights_base, fs_rights_inheriting, fd_flags);
        if (ret != 0) {
          return ret;
        }
        self.fds.push(fd_obj);
        let opened_fd = self.fds.length - 1;
        buffer.setUint32(opened_fd_ptr, opened_fd, true);
        return 0;
      } else {
        return ERRNO_BADF;
      }
    }, path_readlink(fd, path_ptr, path_len, buf_ptr, buf_len, nread_ptr) {
      let buffer = new DataView(self.inst.exports.memory.buffer);
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        let { ret, data } = self.fds[fd].path_readlink(path);
        if (data != null) {
          if (data.length > buf_len) {
            buffer.setUint32(nread_ptr, 0, true);
            return ERRNO_BADF;
          }
          buffer8.set(data, buf_ptr);
          buffer.setUint32(nread_ptr, data.length, true);
        }
        return ret;
      } else {
        return ERRNO_BADF;
      }
    }, path_remove_directory(fd, path_ptr, path_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        return self.fds[fd].path_remove_directory(path);
      } else {
        return ERRNO_BADF;
      }
    }, path_rename(fd, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) {
      throw "FIXME what is the best abstraction for this?";
    }, path_symlink(old_path_ptr, old_path_len, fd, new_path_ptr, new_path_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let old_path = new TextDecoder("utf-8").decode(buffer8.slice(old_path_ptr, old_path_ptr + old_path_len));
        let new_path = new TextDecoder("utf-8").decode(buffer8.slice(new_path_ptr, new_path_ptr + new_path_len));
        return self.fds[fd].path_symlink(old_path, new_path);
      } else {
        return ERRNO_BADF;
      }
    }, path_unlink_file(fd, path_ptr, path_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      if (self.fds[fd] != void 0) {
        let path = new TextDecoder("utf-8").decode(buffer8.slice(path_ptr, path_ptr + path_len));
        return self.fds[fd].path_unlink_file(path);
      } else {
        return ERRNO_BADF;
      }
    }, poll_oneoff(in_, out, nsubscriptions) {
      throw "async io not supported";
    }, proc_exit(exit_code) {
      throw "exit with exit code " + exit_code;
    }, proc_raise(sig) {
      throw "raised signal " + sig;
    }, sched_yield() {
    }, random_get(buf, buf_len) {
      let buffer8 = new Uint8Array(self.inst.exports.memory.buffer);
      for (let i = 0; i < buf_len; i++) {
        buffer8[buf + i] = Math.random() * 256 | 0;
      }
    }, sock_recv(fd, ri_data, ri_flags) {
      throw "sockets not supported";
    }, sock_send(fd, si_data, si_flags) {
      throw "sockets not supported";
    }, sock_shutdown(fd, how) {
      throw "sockets not supported";
    } };
  }
};

// src/plugin.ts
var ExtismPlugin = class {
  constructor(moduleData, functions = {}, config) {
    this.moduleData = moduleData;
    this.allocator = new Allocator(1024 * 1024);
    this.config = config;
    this.vars = {};
    this.input = new Uint8Array();
    this.output = new Uint8Array();
    this.functions = functions;
  }
  getExports() {
    return __async(this, null, function* () {
      const module2 = yield this._instantiateModule();
      return module2.instance.exports;
    });
  }
  getImports() {
    return __async(this, null, function* () {
      const module2 = yield this._instantiateModule();
      return WebAssembly.Module.imports(module2.module);
    });
  }
  getInstance() {
    return __async(this, null, function* () {
      const module2 = yield this._instantiateModule();
      return module2.instance;
    });
  }
  call(func_name, input) {
    return __async(this, null, function* () {
      const module2 = yield this._instantiateModule();
      if (typeof input === "string") {
        this.input = new TextEncoder().encode(input);
      } else if (input instanceof Uint8Array) {
        this.input = input;
      } else {
        throw new Error("input should be string or Uint8Array");
      }
      this.allocator.reset();
      let func = module2.instance.exports[func_name];
      if (!func) {
        throw Error(`function does not exist ${func_name}`);
      }
      func();
      return this.output;
    });
  }
  _instantiateModule() {
    return __async(this, null, function* () {
      if (this.module) {
        return this.module;
      }
      const environment = this.makeEnv();
      const args = [];
      const envVars = [];
      let fds = [];
      let wasi = new WASI(args, envVars, fds);
      let env = {
        wasi_snapshot_preview1: wasi.wasiImport,
        env: environment
      };
      this.module = yield WebAssembly.instantiate(this.moduleData, env);
      wasi.inst = this.module.instance;
      if (this.module.instance.exports._start) {
        this.module.instance.exports._start();
      }
      return this.module;
    });
  }
  makeEnv() {
    const plugin = this;
    var env = {
      extism_alloc(n) {
        return plugin.allocator.alloc(n);
      },
      extism_free(n) {
        plugin.allocator.free(n);
      },
      extism_load_u8(n) {
        return plugin.allocator.memory[Number(n)];
      },
      extism_load_u64(n) {
        let cast = new DataView(plugin.allocator.memory.buffer, Number(n));
        return cast.getBigUint64(0, true);
      },
      extism_store_u8(offset, n) {
        plugin.allocator.memory[Number(offset)] = Number(n);
      },
      extism_store_u64(offset, n) {
        const tmp = new DataView(plugin.allocator.memory.buffer, Number(offset));
        tmp.setBigUint64(0, n, true);
      },
      extism_input_length() {
        return BigInt(plugin.input.length);
      },
      extism_input_load_u8(i) {
        return plugin.input[Number(i)];
      },
      extism_input_load_u64(idx) {
        let cast = new DataView(plugin.input.buffer, Number(idx));
        return cast.getBigUint64(0, true);
      },
      extism_output_set(offset, length) {
        const offs = Number(offset);
        const len = Number(length);
        plugin.output = plugin.allocator.memory.slice(offs, offs + len);
      },
      extism_error_set(i) {
        throw plugin.allocator.getString(i);
      },
      extism_config_get(i) {
        if (typeof plugin.config === "undefined") {
          return BigInt(0);
        }
        const key = plugin.allocator.getString(i);
        if (key === null) {
          return BigInt(0);
        }
        const value = plugin.config.get(key);
        if (typeof value === "undefined") {
          return BigInt(0);
        }
        return plugin.allocator.allocString(value);
      },
      extism_var_get(i) {
        const key = plugin.allocator.getString(i);
        if (key === null) {
          return BigInt(0);
        }
        const value = plugin.vars[key];
        if (typeof value === "undefined") {
          return BigInt(0);
        }
        return plugin.allocator.allocBytes(value);
      },
      extism_var_set(n, i) {
        const key = plugin.allocator.getString(n);
        if (key === null) {
          return;
        }
        const value = plugin.allocator.getBytes(i);
        if (value === null) {
          return;
        }
        plugin.vars[key] = value;
      },
      extism_http_request(n, i) {
        debugger;
        return 0;
      },
      extism_length(i) {
        return plugin.allocator.getLength(i);
      },
      extism_log_warn(i) {
        const s = plugin.allocator.getString(i);
        console.warn(s);
      },
      extism_log_info(i) {
        const s = plugin.allocator.getString(i);
        console.log(s);
      },
      extism_log_debug(i) {
        const s = plugin.allocator.getString(i);
        console.debug(s);
      },
      extism_log_error(i) {
        const s = plugin.allocator.getString(i);
        console.error(s);
      }
    };
    for (const [name, func] of Object.entries(this.functions)) {
      env[name] = function() {
        return func.apply(plugin, arguments);
      };
    }
    return env;
  }
};

// src/context.ts
var ExtismContext = class {
  newPlugin(_0) {
    return __async(this, arguments, function* (manifest, functions = {}, config) {
      let moduleData = null;
      if (manifest instanceof ArrayBuffer) {
        moduleData = manifest;
      } else if (manifest.wasm) {
        const wasmData = manifest.wasm;
        if (wasmData.length > 1)
          throw Error("This runtime only supports one module in Manifest.wasm");
        const wasm = wasmData[0];
        if (wasm.data) {
          moduleData = wasm.data;
        } else if (wasm.path) {
          const response = yield fetch(wasm.path);
          moduleData = yield response.arrayBuffer();
          console.dir(moduleData);
        }
      }
      if (!moduleData) {
        throw Error(`Unsure how to interpret manifest ${manifest}`);
      }
      return new ExtismPlugin(moduleData, functions, config);
    });
  }
};

export {
    ExtismContext,
    ExtismPlugin
}