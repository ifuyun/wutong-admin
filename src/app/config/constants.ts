export const TREE_ROOT_NODE_KEY = 'root';

export const POST_TITLE_LENGTH = 100;
export const POST_EXCERPT_LENGTH = 140;
export const POST_TAXONOMY_SIZE = 5;
export const POST_TAG_SIZE = 15;
export const POST_SOURCE_LENGTH = 100;
export const POST_AUTHOR_LENGTH = 50;

export const COMMENT_LENGTH = 800;

export const TAXONOMY_NAME_LENGTH = 20;
export const TAXONOMY_SLUG_LENGTH = 50;
export const TAXONOMY_DESCRIPTION_LENGTH = 40;

export const LINK_NAME_LENGTH = 20;
export const LINK_URL_LENGTH = 100;
export const LINK_DESCRIPTION_LENGTH = 40;

export const SITE_TITLE_LENGTH = 20;
export const SITE_DESCRIPTION_LENGTH = 400;
export const SITE_SLOGAN_LENGTH = 100;
export const SITE_URL_LENGTH = 100;
export const SITE_KEYWORDS_LENGTH = 200;
export const SITE_KEYWORDS_SIZE = 20;
export const SITE_ADMIN_EMAIL_LENGTH = 100;
export const SITE_ICP_NUM_LENGTH = 50;
export const SITE_COPYRIGHT_LENGTH = 100;
export const UPLOAD_URL_PREFIX_LENGTH = 20;

export const POST_STATUS: Record<string, string> = Object.freeze({
  publish: '公开',
  password: '加密',
  private: '隐藏',
  draft: '草稿',
  'auto-draft': '自动保存草稿',
  trash: '已删除'
});

export const COMMENT_FLAG: Record<string, string> = Object.freeze({
  open: '允许',
  verify: '审核',
  close: '禁止'
});

export const COPYRIGHT_TYPE: Record<string, string> = Object.freeze({
  '0': '禁止转载',
  '1': '转载需授权',
  '2': 'CC-BY-NC-ND'
});

export const COMMENT_STATUS: Record<string, string> = Object.freeze({
  normal: '正常',
  pending: '待审',
  reject: '驳回',
  spam: '垃圾评论',
  trash: '已删除'
});

export const COMMENT_STATUS_LIST = Object.freeze(Object.keys(COMMENT_STATUS).map((item) => ({
  key: item,
  label: COMMENT_STATUS[item]
})));

export const TAXONOMY_STATUS: Record<string, string> = Object.freeze({
  publish: '公开',
  private: '隐藏',
  trash: '已删除'
});

export const TAXONOMY_STATUS_LIST = Object.freeze(Object.keys(TAXONOMY_STATUS).map((item) => ({
  key: item,
  label: TAXONOMY_STATUS[item]
})));

export const LINK_SCOPE: Record<string, string> = Object.freeze({
  site: '全站',
  homepage: '首页'
});

export const LINK_TARGET: Record<string, string> = Object.freeze({
  _blank: '新页面',
  _self: '当前页',
  _top: '父页面'
});

export const LINK_STATUS: Record<string, string> = Object.freeze({
  normal: '正常',
  trash: '已删除'
});
