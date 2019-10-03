import React from 'React'
import {Grid, GridItem, Spinner} from 'nr1'
import _ from 'underscore'

import getCardinality from '../../lib/get-cardinality'
import timePickerNrql from '../../lib/time-picker-nrql'

import FacetTable from './facet-table'
import Filter from './filter'
import ContainerPanel from '../shared/container-panel'
import ContainerHeatMap from './container-heat-map'

const OMIT_KEYS = {
  systemMemoryBytes: true,
  apmApplicationIds: true,
  containerId: true,
  commandLine: true,
  commandName: true,
  processId: true,
  processDisplayName: true,
}

function GroupList({ groups, group, selectGroup, showNone }) {
  return <div className="facet-list-container">
    <h3 className="facet-list-header">Group By</h3>
    <ul className="face-list">
    {showNone && <li className={`facet ${group === null || group === undefined ? 'selected' : ''}`} key="__none" onClick={() => selectGroup(null)}>
      <em>None: Show CPU, Memory and Disk I/O</em>
    </li>}
    {groups.map(g => {
      const className = `facet ${g.name == group && 'selected'}`
      return <li className={className} key={g.name} onClick={() => selectGroup(g.name)}>
        <span className="facet-name">{g.name}</span>
        <span className="facet-count">{g.count}</span>
      </li>
    })}
  </ul>
  </div>
}

export default class ContainerExplorer extends React.Component {
  constructor(props) {
    super(props)

    this.selectContainer = this.selectContainer.bind(this)
    this.toggleDetailPanel = this.toggleDetailPanel.bind(this)

    this.state = {
      detailPanelExpanded: false
    }
  }

  toggleDetailPanel() {
    this.setState({detailPanelExpanded: !this.state.detailPanelExpanded})
  }

  async componentDidMount() {
    await this.reload()
  }

  componentWillUnmount() {
    if(this.interval) clearInterval(this.interval)
  }

  async componentDidUpdate({where, account}) {
    if(where != this.props.where || account != this.props.account) {
      await this.reload()
    }
  }

  async reload() {
    clearInterval(this.interval)
    this.interval = null

    const startTime = new Date()
    function logTime(message) {
      const elapsed = new Date() - startTime
      // console.log("Reload", message, elapsed)
    }
    logTime("Start Reload")

    this.setState({groups: null})
    const {where, account, counts} = this.props
    const timeWindow = "SINCE 3 minutes ago"

    const facets = await getCardinality({
      eventType: 'ProcessSample',
      accountId: account.id,
      where,
      timeWindow
    })
    logTime("getCardinality")

    const groups = facets.filter(facet => {
      return facet.count > 1 && facet.count < counts.containers * .6 && !OMIT_KEYS[facet.name]
    })

    this.setState({groups: _.sortBy(groups, 'name')})
  }

  selectContainer(containerId) {
    this.setState({containerId})
  }

  render() {
    const {addFilter, counts, account, filters, removeFilter} = this.props
    const {groups, group, containerId } = this.state || {}

    if(!groups) return <Spinner/>

    const tooMany = counts.containers > 2000
    const timeRange = timePickerNrql(this.props)
    const showFacetTable = tooMany && group
    const { detailPanelExpanded } = this.state

    return <div className='container-explorer'>
      <Grid className='container-explorer-grid' spacingType={[Grid.SPACING_TYPE.NONE]}>
        <GridItem className='facet-list-container-grid' columnSpan={3}>
          {groups && <GroupList groups={groups} group={group} showNone={!tooMany}
            selectGroup={(group)=> this.setState({group})}/>}
        </GridItem>
        <GridItem className='container-explorer-container' columnSpan={containerId && !detailPanelExpanded ? 6 : 9}>
          <div className="filters-container">
            {filters.map(filterProps => {
              return (
                <Filter
                  key={filterProps.name}
                  {...filterProps}
                  removeFilter={removeFilter}
                />
              )
            })}
          </div>

          {!showFacetTable  && <ContainerHeatMap {...this.props} {...this.state}
            selectContainer={this.selectContainer}
            setFacetValue={(value) => addFilter(group, value)}
            />}
          {showFacetTable && <FacetTable
              {...this.props} {...this.state}
            setFacetValue={(value) => addFilter(group, value)}/>}
        </GridItem>
        {containerId &&
          <GridItem 
            className={`detail-pane-grid-item ${detailPanelExpanded ? `detail-pane-grid-minimized` : `detail-pane-grid-expanded`}`}  
            columnSpan={detailPanelExpanded ? 0 : 3}
          >
            <ContainerPanel
              account={account}
              containerId={containerId}
              timeRange={timeRange}
              onSelectAttribute={(key, value) => addFilter(key, value)}
              showRelatedApps onClose={() => this.setState({containerId: null})}
              toggleDetailPanel={this.toggleDetailPanel}
            />
          </GridItem>
        }
      </Grid>
    </div>
  }

}