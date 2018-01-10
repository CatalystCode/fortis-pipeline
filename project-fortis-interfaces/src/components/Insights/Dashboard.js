import React from 'react';
import DataSelector from './DataSelector';
import HeatMap from './Maps/HeatMap';
import SentimentTreeview from './SentimentTreeview';
import GraphCard from '../Graphics/GraphCard';
import ActivityFeed from './ActivityFeed';
import CsvExporter from './CsvExporter';
import TopicCloud from './TopicCloud';
import TimeSeriesGraph from './TimeSeriesGraph';
import PopularLocationsChart from './PopularLocationsChart';
import PopularSourcesChart from './PopularSourcesChart';
import ReactGridLayout from 'react-grid-layout';
import { defaultLayout } from './Layouts';
import { hasChanged } from './shared';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../../styles/Insights/Dashboard.css';
import { HeatmapToggle } from './HeatmapToggle';
import LanguagePicker from './LanguagePicker';

let ResponsiveReactGridLayout = ReactGridLayout.Responsive;
const WidthProvider = ReactGridLayout.WidthProvider;
ResponsiveReactGridLayout = WidthProvider(ResponsiveReactGridLayout);

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.onResizeStop = this.onResizeStop.bind(this);
    this.toggleHeatmapSize = this.toggleHeatmapSize.bind(this);

    this.state = {
      contentRowHeight: 0,
      newsfeedResizedHeight: 0,
      watchlistResizedHeight: 0,
      contentAreaHeight: 0,
      mounted: false,
      isHeatmapFullScreen: false
    };
  }

  componentDidMount() {
    const rowInitialHeight = document.getElementById("leafletMap") || { clientHeight: 0 };
    const contentAreaHeight = document.getElementById("contentArea");
    this.setState({ contentRowHeight: rowInitialHeight.clientHeight, contentAreaHeight: contentAreaHeight.clientHeight, mounted: true });
  }

  onResizeStop(item, oldItem, newItem, placeholder, e, element) {
    const height = e.toElement.clientHeight;

    const resizedItemId = newItem.i;
    const resizeStateHeightItems = ['newsfeed', 'watchlist'];
    if (resizeStateHeightItems.indexOf(resizedItemId) > -1) {
      const newState = {};
      newState[resizedItemId + 'ResizedHeight'] = height;
      this.setState(newState);
    }
  }

  onChangeLanguage = (language) => {
    this.props.flux.actions.DASHBOARD.changeLanguage(language, this.props.category);
  }

  toggleHeatmapSize() {
    const newsfeedResizedHeight = 0;
    const watchlistResizedHeight = 0;
    this.setState({ newsfeedResizedHeight, watchlistResizedHeight, isHeatmapFullScreen: !this.state.isHeatmapFullScreen });
  }

  filterLiterals() {
    const { dataSource, zoomLevel, enabledStreams, selectedplace, flux, bbox, timespanType, termFilters, maintopic, externalsourceid, datetimeSelection, fromDate, toDate, language } = this.props;
    const defaultLanguage = this.props.settings.defaultLanguage;
    const defaultZoom = parseInt(this.props.settings.defaultZoomLevel, 10);
    const conjunctiveTermsLength = termFilters.size;

    return Object.assign({}, { zoomLevel, dataSource, enabledStreams, selectedplace, conjunctiveTermsLength, defaultZoom, flux, maintopic, defaultLanguage,
       termFilters, bbox, timespanType, externalsourceid, datetimeSelection, fromDate, toDate, language });
  }

  heatmapComponent() {
    return (
      <div key={'heatmap'} className="heatmapContainer">
        <div>
          <div id='leafletMap'></div>
          <HeatMap
            mapSvcToken={this.props.settings.mapSvcToken}
            targetBbox={this.props.settings.targetBbox}
            heatmapTileIds={this.props.heatmapTileIds}
            placeCentroid={this.props.placeCentroid}
            {...this.filterLiterals() }
          />
        </div>
      </div>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return hasChanged(this.props, nextProps);
  }

  newsfeedComponent() {
    const { bbox } = this.props;
    const { contentAreaHeight, contentRowHeight, newsfeedResizedHeight, isHeatmapFullScreen } = this.state;

    return (
      <div key={'newsfeed'}>
        <div id="newsfeed-container">
          {bbox.length ?
            <ActivityFeed
              allSiteTopics={this.props.fullTermList}
              trustedSources={this.props.trustedSources}
              settings={this.props.settings}
              infiniteScrollHeight={isHeatmapFullScreen ? contentAreaHeight : newsfeedResizedHeight > 0 ? newsfeedResizedHeight : contentRowHeight}
              {...this.filterLiterals() }
            />
            : undefined}
        </div>
      </div>
    );
  }

  topLocationsComponent() {
    const cardHeader = {
      title: "Popular Locations"
    };

    return (
      <div key={'locations'} className="doughnutChart">
        <GraphCard cardHeader={cardHeader}>
          <PopularLocationsChart
            popularLocations={this.props.popularLocations}
            {...this.filterLiterals() }
          />
        </GraphCard>
      </div>
    );
  }

  topTopicsComponent() {
    const cardHeader = {
      title: "Popular Topics"
    };

    return (
      <div key={'topics'} className="doughnutChart">
        <GraphCard cardHeader={cardHeader}>
          <TopicCloud
            allSiteTopics={this.props.fullTermList}
            popularTerms={this.props.popularTerms}
            {...this.filterLiterals() }
          />
        </GraphCard>
      </div>
    );
  }

  topSourcesComponent() {
    const cardHeader = {
      title: "Popular Sources"
    };

    return (
      <div key={'sources'} className="doughnutChart">
        <GraphCard cardHeader={cardHeader}>
          <PopularSourcesChart
            topSources={this.props.topSources}
            {...this.filterLiterals() }
          />
        </GraphCard>
      </div>
    );
  }

  refreshDashboard = (includeCsv) => {
    const { dataSource, timespanType, termFilters, datetimeSelection, zoomLevel, maintopic, bbox, fromDate, toDate, externalsourceid, selectedplace } = this.filterLiterals();
    this.props.flux.actions.DASHBOARD.reloadVisualizationState(fromDate, toDate, datetimeSelection, timespanType, dataSource, maintopic, bbox, zoomLevel, Array.from(termFilters), externalsourceid, includeCsv, selectedplace);
  }

  refreshDashboardWithCsv = () => {
    this.refreshDashboard(true);
  }

  timelineComponent() {
    return (
      <div key={'timeline'}>
          <TimeSeriesGraph
            allSiteTopics={this.props.fullTermList}
            refreshDashboardFunction={this.refreshDashboard}
            timeSeriesGraphData={this.props.timeSeriesGraphData}
            {...this.filterLiterals() }
          />
      </div>
    );
  }

  watchlistComponent() {
    const { contentAreaHeight, contentRowHeight, watchlistResizedHeight, isHeatmapFullScreen } = this.state;

    return (
      <div key={'watchlist'}>
        <GraphCard>
          <SentimentTreeview
            trustedSources={this.props.trustedSources}
            conjunctivetopics={this.props.conjunctivetopics}
            defaultBbox={this.props.settings.targetBbox}
            allSiteTopics={this.props.fullTermList}
            featureservicenamespace={this.props.settings.featureservicenamespace}
            height={isHeatmapFullScreen ? contentAreaHeight : (watchlistResizedHeight > 0) ? watchlistResizedHeight : contentRowHeight}
            {...this.filterLiterals() }
          />
        </GraphCard>
      </div>
    );
  }

  renderGridCards() {
    return this.state.isHeatmapFullScreen
      ? [this.watchlistComponent(), this.heatmapComponent(), this.newsfeedComponent()]
      : [this.topLocationsComponent(), this.topTopicsComponent(), this.topSourcesComponent(), this.timelineComponent(), this.watchlistComponent(), this.heatmapComponent(), this.newsfeedComponent()];
  }

  renderActionsFooter() {
    return (
      <footer className="navbar-fixed-bottom footer dashboard-footer fortis-navbar">
        <div className="dashboard-actions">
          <div className="dashboard-action">
            <HeatmapToggle
              tooltipOn="Click to expand heatmap"
              tooltipOff="Click to shrink heatmap"
              tooltipPosition="top-right"
              onClick={this.toggleHeatmapSize}
            />
          </div>
          <div className="dashboard-action">
            <CsvExporter
              csvs={[
                {name: 'Timeseries', url: this.props.timeSeriesCsv},
                {name: 'Top locations', url: this.props.popularLocationsCsv},
                {name: 'Top terms', url: this.props.popularTermsCsv},
                {name: 'Top sources', url: this.props.topSourcesCsv},
              ]}
              tooltipPosition="top-center"
              fetchCsvs={this.refreshDashboardWithCsv}
            />
          </div>
          <div className="dashboard-action">
            <LanguagePicker
              tooltipPosition="top-left"
              supportedLanguages={this.props.settings.supportedLanguages}
              language={this.props.language}
              onChangeLanguage={this.onChangeLanguage}
            />
          </div>
        </div>
      </footer>
    );
  }

  render() {
    const { isHeatmapFullScreen, mounted } = this.state;

    return (
      <div>
        <div className="app-container">
          <div className="container-fluid">
            {this.renderActionsFooter()}
            <DataSelector
              {...this.filterLiterals() }
            />
            <div className="row" id="contentArea">
              <div className="dashboard-grid">
                <ResponsiveReactGridLayout
                  measureBeforeMount={false}
                  className="layout"
                  isDraggable={false}
                  layouts={isHeatmapFullScreen ? defaultLayout.layoutCollapsed : defaultLayout.layout}
                  cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
                  rowHeight={34}
                  onResizeStop={this.onResizeStop}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  useCSSTransforms={mounted}>
                    {this.renderGridCards()}
                </ResponsiveReactGridLayout>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}