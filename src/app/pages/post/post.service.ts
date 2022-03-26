import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadcrumbEntity } from '../../components/breadcrumb/breadcrumb.interface';
import { ApiUrl } from '../../config/api-url';
import { PostType } from '../../config/common.enum';
import { ApiService } from '../../core/api.service';
import { Post, PostArchiveDate, PostArchiveDatesQueryParam, PostList, PostQueryParam } from './post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(
    private apiService: ApiService
  ) {
  }

  getPosts(param: PostQueryParam): Observable<{ postList: PostList, crumbs: BreadcrumbEntity[] }> {
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_POSTS), param).pipe(
      map((res) => res?.data || {})
    );
  }

  getPostById(postId: string): Observable<Post> {
    return this.apiService.httpGet(this.apiService.getApiUrlWithParam(ApiUrl.GET_POST, postId)).pipe(
      map((res) => res?.data || {})
    );
  }

  getPostArchiveDates(param: PostArchiveDatesQueryParam): Observable<PostArchiveDate[]> {
    const {showCount, status, from} = param;
    let { postType, limit } = param;
    if (limit === null || limit === undefined) {
      limit = 10;
    }
    postType = postType || PostType.POST;
    const reqParam: any = {
      postType,
      showCount: showCount ? 1 : 0,
      limit,
      from
    };
    if (status && status.length > 0) {
      reqParam.status = status;
    }
    return this.apiService.httpGet(this.apiService.getApiUrl(ApiUrl.GET_POST_ARCHIVE_DATES), reqParam).pipe(
      map((res) => res?.data || [])
    );
  }
}
