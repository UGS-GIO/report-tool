import { FC, ReactNode } from 'react';
import config from '../config';
import './SummaryPage.scss';
import { kebabCase } from 'lodash';

interface HazardUnit {
  HazardName: string;
  UnitName: string;
}

interface SummaryPageProps {
  groupToHazardMap: Record<string, string[]>;
  hazardToUnitMap: Record<string, HazardUnit[]>;
  Top: string;
  'Table1headingautogenerated table': string;
  Bottom: string;
  children?: ReactNode;
}

const SummaryPage: FC<SummaryPageProps> = (props) => {
  // console.log('SummaryPage.render', props);

  let hazardUnits: HazardUnit[] = [];
  Object.values(props.groupToHazardMap).forEach(hazardCodes => {
    hazardCodes.forEach(code => {
      hazardUnits = hazardUnits.concat(props.hazardToUnitMap[code]);
    })
  });

  return (
    <div className="page-break summary-page">
      <div className="header">
        <h1>Report Summary</h1>
      </div>
      <p dangerouslySetInnerHTML={{ __html: props.Top }} title={config.notProd ? "ReportTextTable.Text(Top)" : ""}></p>
      <p dangerouslySetInnerHTML={{ __html: props['Table1headingautogenerated table'] }}
        title={config.notProd ? "ReportTextTable.Text(Table 1 heading...)" : ""}></p>
      <table className="summary-page__table summary-page__table--bordered">
        <thead>
          <tr>
            <th>Mapped Geologic Hazards</th>
            <th>Hazard Category</th>
          </tr>
        </thead>
        <tbody>
          {hazardUnits.map((unit, index) =>
            <tr key={index}>
              <td><a href={`#${kebabCase(unit.HazardName)}`}>{unit.HazardName}</a></td>
              <td>{unit.UnitName}</td>
            </tr>
          )}
        </tbody>
      </table>
      <p dangerouslySetInnerHTML={{ __html: props.Bottom }} title={config.notProd ? "ReportTextTable.Text(Bottom)" : ""}></p>
    </div>
  );
};

export default SummaryPage;