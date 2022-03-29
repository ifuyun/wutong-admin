export enum Role {
  ADMIN = 'admin'
}

export enum PostType {
  POST = 'post',
  PAGE = 'page',
  REVISION = 'revision',
  ATTACHMENT = 'attachment'
}

export enum PostStatus {
  PUBLISH = 'publish',
  PASSWORD = 'password',
  PRIVATE = 'private',
  DRAFT = 'draft',
  AUTO_DRAFT = 'auto-draft',
  TRASH = 'trash'
}

export enum PostOriginal {
  YES = 1,
  NO = 0
}

export enum CommentFlag {
  OPEN = 'open',
  VERIFY = 'verify',
  CLOSE = 'close'
}

export enum CommentStatus {
  NORMAL = 'normal',
  PENDING = 'pending',
  REJECT = 'reject',
  SPAM = 'spam',
  TRASH = 'trash'
}

export enum CommentOperation {
  EDIT = 'edit',
  REPLY = 'reply',
  DETAIL = 'detail'
}

export enum CommentAuditAction {
  RESOLVE = 'normal',
  REJECT = 'reject',
  SPAM = 'spam',
  TRASH = 'trash'
}

export enum TaxonomyType {
  POST = 'post',
  LINK = 'link',
  TAG = 'tag'
}

export enum TaxonomyStatus {
  CLOSED = 0,
  OPEN = 1,
  TRASH = 2
}

export enum LinkVisible {
  SITE = 'site',
  HOMEPAGE = 'homepage',
  INVISIBLE = 'invisible'
}

export enum LinkTarget {
  BLANK = '_blank',
  TOP = '_top',
  SELF = '_self'
}

export enum CopyrightType {
  FORBIDDEN = 0,
  AUTHORIZED = 1,
  CC = 2
}
