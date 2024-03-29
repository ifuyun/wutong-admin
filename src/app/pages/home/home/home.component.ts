import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Chart } from '@antv/g2';
import * as moment from 'moment';
import { Duration } from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BreadcrumbData } from '../../../components/breadcrumb/breadcrumb.interface';
import { BreadcrumbService } from '../../../components/breadcrumb/breadcrumb.service';
import { CommentAction, CommentAuditAction, PostType } from '../../../config/common.enum';
import { SERVER_START_AT } from '../../../config/constants';
import { Message } from '../../../config/message.enum';
import { ResponseCode } from '../../../config/response-code.enum';
import { CommonService } from '../../../core/common.service';
import { PageComponent } from '../../../core/page.component';
import { OptionEntity } from '../../options/option.interface';
import { CommentModel } from '../../comments/comment.interface';
import { CommentService } from '../../comments/comment.service';
import { OptionService } from '../../options/option.service';
import { PostArchiveDate, PostModel } from '../../posts/post.interface';
import { PostService } from '../../posts/post.service';
import { VoteModel } from '../../votes/vote.interface';
import { VoteService } from '../../votes/vote.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent extends PageComponent implements OnInit, OnDestroy, AfterViewInit {
  serverDuration!: Duration;
  chartDimension: 'month' | 'year' = 'month';
  statData!: Record<string, number>;
  comments: CommentModel[] = [];
  commentModalVisible = false;
  postModalVisible = false;
  commentAction!: CommentAction;
  activeComment!: CommentModel;
  activePost!: { post: PostModel, postMeta: Record<string, string> };
  votes: VoteModel[] = [];

  protected titles: string[] = [];
  protected breadcrumbData: BreadcrumbData = {
    visible: false,
    list: []
  };

  private chartData: { date: string, count: number }[] = [];
  private postChart!: Chart;
  private archiveList!: PostArchiveDate[];
  private auditLoading = false;
  private options: OptionEntity = {};
  private optionsListener!: Subscription;
  private archiveListener!: Subscription;
  private statListener!: Subscription;
  private chartResizeListener!: Subscription;
  private commentsListener!: Subscription;
  private votesListener!: Subscription;
  private serverTimer!: any;

  constructor(
    protected title: Title,
    protected breadcrumbService: BreadcrumbService,
    private optionService: OptionService,
    private postService: PostService,
    private commonService: CommonService,
    private commentService: CommentService,
    private voteService: VoteService,
    private message: NzMessageService,
    private modal: NzModalService
  ) {
    super();
  }

  ngOnInit() {
    this.optionsListener = this.optionService.options$.subscribe((options) => {
      this.options = options;
    });
    this.updatePageInfo();
    this.updateDuration();
    this.fetchArchiveData();
    this.statListener = this.commonService.getStatData().subscribe((res) => {
      this.statData = res;
    });
    this.fetchComments();
    this.fetchVotes();
    this.serverTimer = setInterval(() => this.updateDuration(), 60000);
  }

  ngAfterViewInit() {
    this.showChart();
    this.chartResizeListener = this.resizeObservable(<HTMLElement>document.getElementById('countChart'))
      .pipe(debounceTime(200))
      .subscribe((entries: ResizeObserverEntry[]) => {
        if (entries.length > 0) {
          const cr = entries[0].contentRect;
          this.postChart && this.postChart.changeSize(cr.width, cr.height);
        }
      });
  }

  ngOnDestroy(): void {
    this.optionsListener.unsubscribe();
    this.archiveListener.unsubscribe();
    this.statListener.unsubscribe();
    this.commentsListener.unsubscribe();
    this.votesListener.unsubscribe();
    clearInterval(this.serverTimer);
    this.chartResizeListener.unsubscribe();
  }

  updateChartData() {
    if (this.chartDimension === 'month') {
      this.chartData = this.archiveList.map((item) => ({ date: item.dateText, count: item.count || 0 }))
        .sort((a, b) => a.date > b.date ? 1 : -1);
    } else {
      const data: Record<string, number> = {};
      this.archiveList.map((item) => ({ date: item.dateText.split('/')[0], count: item.count || 0 }))
        .forEach((item) => data[item.date] = (data[item.date] || 0) + item.count);
      this.chartData = Object.keys(data).map((item) => ({ date: item, count: data[item] }));
    }
    this.postChart.changeData(this.chartData);
  }

  showCommentModal(action: string, comment: CommentModel) {
    this.commentAction = <CommentAction>action;
    this.activeComment = comment;
    this.commentModalVisible = true;
  }

  closeCommentModal() {
    this.commentModalVisible = false;
  }

  onCommentSave() {
    this.fetchComments();
  }

  showPostModal(vote: VoteModel) {
    this.activePost = { post: vote.post, postMeta: vote.postMeta };
    this.postModalVisible = true;
  }

  closePostModal() {
    this.postModalVisible = false;
  }

  auditComments(action: string, commentId: string) {
    let actionDesc: string;
    let modalContent: string;
    switch (action) {
      case CommentAuditAction.RESOLVE:
        actionDesc = '批准';
        modalContent = '确定批准这条评论吗？';
        break;
      case CommentAuditAction.TRASH:
        actionDesc = '删除';
        modalContent = '确定删除这条评论吗？';
        break;
      case CommentAuditAction.SPAM:
        actionDesc = '标记为垃圾评论';
        modalContent = '确定将这条评论标记为垃圾评论吗？';
        break;
      default:
        actionDesc = '驳回';
        modalContent = '确定驳回这条评论吗？';
    }
    const confirmModal = this.modal.confirm({
      nzTitle: `确定${actionDesc}吗？`,
      nzContent: modalContent,
      nzOkDanger: action === CommentAuditAction.TRASH,
      nzOkLoading: this.auditLoading,
      nzAutofocus: 'ok',
      nzOnOk: () => {
        this.auditLoading = true;
        this.commentService.auditComments({
          commentIds: [commentId],
          action: <CommentAuditAction>action
        }).subscribe((res) => {
          this.auditLoading = false;
          confirmModal.destroy();
          if (res.code === ResponseCode.SUCCESS) {
            this.message.success(Message.SUCCESS);
            this.fetchComments();
          }
        });
        return false;
      }
    });
  }

  protected updateBreadcrumb(breadcrumbData?: BreadcrumbData): void {
    this.breadcrumbService.updateCrumb(this.breadcrumbData);
  }

  private fetchArchiveData() {
    this.archiveListener = this.postService.getPostArchives({
      showCount: true,
      limit: 0,
      postType: PostType.POST,
      fa: 1
    }).subscribe((res) => {
      this.archiveList = res;
      this.updateChartData();
    });
  }

  private showChart() {
    this.postChart = new Chart({
      container: 'countChart',
      autoFit: true
    });
    this.postChart.data(this.chartData);
    this.postChart.scale({
      date: {
        nice: true
      },
      count: {
        nice: true
      }
    });
    this.postChart.axis('date', true);
    this.postChart.tooltip({
      title: (title => {
        const dates = title.split('/');
        if (dates.length > 1) {
          return `${dates[0]}年${dates[1]}月`;
        }
        return `${dates[0]}年`;
      }),
      itemTpl: `
        <li class="g2-tooltip-list-item">
          <span class="g2-tooltip-marker" style="background-color:{color};"></span>
          <span class="g2-tooltip-name">发文</span>:<span class="g2-tooltip-value">{value} 篇</span>
        </li>`
    });
    this.postChart.line().position('date*count');
    this.postChart.render();
  }

  private resizeObservable(ele: HTMLElement): Observable<ResizeObserverEntry[]> {
    return new Observable((subscriber) => {
      const observer = new ResizeObserver((entries) => subscriber.next(entries));
      observer.observe(ele);
      return () => observer.unobserve(ele);
    });
  }

  private fetchComments() {
    this.commentsListener = this.commentService.getRecentComments(5).subscribe((res) => this.comments = res);
  }

  private fetchVotes() {
    this.votesListener = this.voteService.getVotes({
      page: 1,
      pageSize: 10
    }).subscribe((res) => this.votes = res.votes || []);
  }

  private updatePageInfo() {
    this.titles = ['仪表盘', this.options['site_name']];
    this.updateTitle();
    this.updateBreadcrumb();
  }

  private updateDuration() {
    this.serverDuration = moment.duration(moment().diff(moment(SERVER_START_AT)));
  }
}
