import React from 'react';
import { PlatformStateContext, Spinner } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';

import quote from '../../lib/quote';
import nrdbQuery from '../../lib/nrdb-query';
import findRelatedAccountsWith from '../../lib/find-related-account-with';
import accountAppList from '../../lib/account-app-list';

import ContainerExplorer from './container-explorer';
import Header from './header';

import PLOTS from '../../lib/plots';


export default class ContainerExplorerNerdlet extends React.Component {
  constructor(props) {
    super(props);

    this.addFilter = this.addFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.setAccount = this.setAccount.bind(this);
    this.setPlot = this.setPlot.bind(this);
    this.setApp = this.setApp.bind(this);
    this.setGroup = this.setGroup.bind(this);
    this.removeAllFilters = this.removeAllFilters.bind(this);

    this.state = {
      filters: [],
      plot: PLOTS[0],
    };
  }

  async componentDidMount() {
    const find = {
      eventType: 'ProcessSample',
      where: 'containerId IS NOT NULL',
      timeWindow: 'SINCE 1 minute ago',
    };
    const accounts = await findRelatedAccountsWith(find);
    await this.setState({ accounts, account: accounts[0] });

    if (accounts.length > 0) {
      this.countProcesses();

      //get the initial list of apps
      const __account = this.state.account;
      const apps = await accountAppList(__account);
      await this.setState({ apps, app: apps[0] }); //set the available app context
    }

  }

  async addFilter(name, value) {
    const { filters } = this.state;
    filters.push({ name, value });

    if (name === 'apmApplicationNames') {
      
      if (value === "All") {

        await this.removeAllFilters();
      } //if
      else {

        await this.setAppFilters(filters);
      } //else

    }//if
    else {
      
      await this.setFilters(filters);
    } //else

  }

  async removeFilter(name, value) {
    let { filters } = this.state;

    filters = filters.filter(f => !(f.name == name && f.value == value));
    this.setFilters(filters);
  }

  removeAllFilters() {
    this.setFilters([]);
  }

  async setFilters(filters) {
    let where = null;
    if (filters != null && filters.length > 0) {
      where = filters
        .map(({ name, value }) => `${quote(name)} = '${value}'`)
        .join(' AND ');
    }

    await this.setState({ filters, where });
    this.countProcesses();
  }

  async setAppFilters(filters) {

    let where = null;
    if (filters != null && filters.length > 0) {
      where = filters
        .map(({ name, value }) => `${quote(name)} LIKE  '%|${value}|%'`)
        .join(' AND ');
    }

    await this.setState({ filters, where });
    this.countProcesses();
  } //setAppFilters

  async setAccount(account) {
    await this.setState({ account, filters: [], where: null, counts: null });
    this.countProcesses();
  }

  async setPlot(plot) {
    await this.setState({ plot });
  }

  async setApp(app) {
    
    await this.setState({ app });
    await this.addFilter("apmApplicationNames", app);
  } //setApp

  async setGroup(group) {
    await this.setState({ group });
  }

  async countProcesses() {
    this.setState({ counts: null });

    const timeWindow = 'SINCE 30 seconds ago';
    const { account, where } = this.state;

    if (!account) return;

    const whereClause = where ? `WHERE ${where}` : '';
    const select = `uniqueCount(entityAndPid) as processes, uniqueCount(entityGuid) as hosts, uniqueCount(containerId) AS containers`;
    const nrql = `SELECT ${select} FROM ProcessSample ${whereClause} ${timeWindow}`;
    const counts = (await nrdbQuery(account.id, nrql))[0];
    this.setState({ counts });
  }

  render() {
    const { account, counts, accounts, apps, app } = this.state; 

    if (!accounts) {
      return <Spinner />;
    }

    if (accounts.length === 0) {
      return (
        <EmptyState
          heading="No Data"
          description="Could not find any infrastructure data with container instrumentation."
          buttonText="Install New Relic Infrastructure today!"
          buttonOnClick={() => {
            const url = 'https://newrelic.com/products/infrastructure';
            window.open(url);
          }}
        />
      );
    }

    return (
      <PlatformStateContext.Consumer>
        {platformUrlState => {
          return(
            <div style={{ height: '100%' }}>
              <Header
                {...this.state}
                setAccount={this.setAccount}
                showFacetPicker={this.showFacetPicker}
                removeFilter={this.removeFilter}
                removeAllFilters={this.removeAllFilters}
                setPlot={this.setPlot}
                setApp={this.setApp}
                timeRange={platformUrlState.timeRange}

              />
              {counts && (
                <ContainerExplorer
                  launcherUrlState={this.props.launcherUrlState}
                  {...this.state}
                  addFilter={this.addFilter}
                  removeFilter={this.removeFilter}
                  setPlot={this.setPlot}
                  setGroup={this.setGroup}
                  setApp={this.setApp}
                />
              )}
            </div>
          )
        }}
      </PlatformStateContext.Consumer>
    );
  }
}