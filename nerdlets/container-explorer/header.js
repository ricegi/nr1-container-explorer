import { Radio, RadioGroup, Spinner, Stack, StackItem, Dropdown, DropdownItem, Button } from 'nr1';
import PLOTS from '../../lib/plots';

function AccountPicker({ accounts, account, setAccount }) {
  return (
    <Dropdown className="account-picker" label="Account" title={account.name}>
      {accounts.map(account => {
        return (
          <DropdownItem onClick={() => setAccount(account)} key={account.id}>
            {account.name}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
}

function PlotPicker({ group, counts, plot, setPlot }) {
  if (group || (counts && counts.containers > 500)) {
    return (
      <Dropdown label="Plot" title={plot.title}>
        {PLOTS.map(p => {
          return (
            <DropdownItem onClick={() => setPlot(p)} key={p.title}>
              {p.title}
            </DropdownItem>
          );
        })}
      </Dropdown>
    );
  }
  return null;
}


function AppPicker({ apps, app, setApp }) {

  if ( apps === undefined ) {

    return(
      <Spinner/>
    );
  } //if
  else {
    return(
      <Dropdown label="Application" title={app}>
        {apps.map(_app => {
  
          return(
            <DropdownItem onClick={() => setApp(_app)} key={_app}>
                {_app}
            </DropdownItem>
          );
        })}
      </Dropdown>
    );
  }

} //AppPicker

export default function Header(props) {
  const { counts, removeAllFilters, filters } = props;
  return (
    <div className="header">
      <Stack
        fullWidth
        className="options-bar"
        verticalType={Stack.VERTICAL_TYPE.CENTER}
      >
        <StackItem>
          <Stack verticalType={Stack.VERTICAL_TYPE.CENTER}>
            <StackItem>
              <AccountPicker {...props} />
            </StackItem>
            <StackItem>
              <AppPicker {...props}/>
            </StackItem>
            <StackItem className="plot-picker-stack-item">
              <PlotPicker {...props}></PlotPicker>
            </StackItem>
            <StackItem className="plot-picker-stack-item">
              <RadioGroup defaultValue="2">
                <Radio label="Containers" value="1" />
                <Radio label="Hosts" value="2" />
              </RadioGroup>
            </StackItem>
          </Stack>
        </StackItem>

        <StackItem className="header-right-side">
          <Stack verticalType={Stack.VERTICAL_TYPE.CENTER}>
            {counts && (
              <StackItem>
                <span className="title">
                  {counts.containers} Containers running on {counts.hosts} Hosts
                </span>
              </StackItem>
            )}
            {filters.length > 0 && (
              <StackItem className="remove-filters-stack-item">
                <Button
                  iconType={
                    Button.ICON_TYPE.INTERFACE__OPERATIONS__FILTER__A_REMOVE
                  }
                  type={Button.TYPE.PRIMARY}
                  onClick={removeAllFilters}
                >
                  Clear all filters
                </Button>
              </StackItem>
            )}
          </Stack>
        </StackItem>
      </Stack>
    </div>
  );
}
