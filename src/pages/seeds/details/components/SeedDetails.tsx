import * as React from 'react';
import GeyserList from '../components/GeyserList';
import SeedSummary from '../components/SeedSummary';
import {
	AddInvalidSeedReportRequest,
	GameUpgrade,
	GeyserType,
	Seed,
	SpaceDestinationType,
	ElementBasicInfo
} from '@api/models';
import { ApplicationState } from '@store/index';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { getSeed, reportInvalidSeed } from '@store/seed-browser/actions';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { SeedDetailsRequestModel } from '@api/request-models';
import { Spin, Collapse } from 'antd';
import StarMap from './StarMap';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import WorldDetails from './WorldDetails';
import GeyserMap from './GeyserMap';

interface PropsFromState {
	seed: Seed;
	geyserTypes: { [key: string]: GeyserType };
	gameUpgrades: { [key: string]: GameUpgrade };
	spaceDestinationTypes: { [key: string]: SpaceDestinationType };
	elementNamesStatesColors: { [key: string]: ElementBasicInfo };
}

interface UrlParams {
	seed: string;
	version: string;
}

interface PropsFromDispatch {
	getSeed: typeof getSeed;
	reportSeedInvalid: typeof reportInvalidSeed;
}

type AllProps = PropsFromState & PropsFromDispatch & RouteComponentProps<UrlParams>;

interface State {
	loading: boolean;
}

class SeedDetails extends React.Component<AllProps, State> {
	constructor(props: AllProps) {
		super(props);

		this.state = {
			loading: true
		};
	}

	componentDidMount() {
		this.props.getSeed({ seedNumber: this.props.match.params.seed, gameVersion: this.props.match.params.version });
	}

	componentDidUpdate(prevProps: AllProps) {
		if (this.props !== prevProps) {
			if (
				this.state.loading &&
				this.props.seed &&
				Object.keys(this.props.geyserTypes).length > 0 &&
				Object.keys(this.props.spaceDestinationTypes).length > 0 &&
				Object.keys(this.props.gameUpgrades).length > 0
			) {
				this.setState({ loading: false });
			}
		}
	}

	reportSeedInvalid = (seedNumber: number, gameVersion: number) => {
		this.props.reportSeedInvalid({ seedNumber, gameVersion });
	};

	public render() {
		const { seed, geyserTypes, gameUpgrades, spaceDestinationTypes, elementNamesStatesColors } = this.props;

		return (
			<Spin spinning={this.state.loading} wrapperClassName="nontransparent fixed" size="large">
				<React.Fragment>
					{!this.state.loading && (
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<SeedSummary
								seed={seed}
								geyserTypes={geyserTypes}
								gameUpgrades={gameUpgrades}
								spaceDestinationTypes={spaceDestinationTypes}
								onReportInvalid={this.reportSeedInvalid}
							/>
							<Collapse
								bordered={false}
								defaultActiveKey={[]}
								style={{ background: 'transparent', marginTop: 16 }}>
								<CollapsePanel
									header="Geyser details"
									key="geyser-stats"
									style={{ background: 'transparent', paddingBottom: 16, border: 0 }}>
									<GeyserList geysers={seed.geysers} geyserTypes={geyserTypes} />
								</CollapsePanel>
								{Object.keys(seed.biomeSizes).length > 0 && (
									<CollapsePanel
										header="World details"
										key="world-details"
										style={{ background: 'transparent', paddingBottom: 16, border: 0 }}>
										<WorldDetails
											biomeSizes={seed.biomeSizes}
											startingBiomeElementMasses={seed.startingBiomeElementMasses}
											elementMasses={seed.elementMasses}
											elements={elementNamesStatesColors}
										/>
									</CollapsePanel>
								)}
								{Object.keys(seed.biomeMap).length > 0 && (
									<CollapsePanel
										header="World Map"
										key="worldmap"
										style={{ background: 'transparent', paddingBottom: 16, border: 0 }}>
										<GeyserMap
											geyserTypes={geyserTypes}
											geysers={seed.geysers}
											biomeMap={seed.biomeMap}
										/>
									</CollapsePanel>
								)}
								{seed.spaceDestinations.length > 0 && (
									<CollapsePanel
										header="Starmap"
										key="starmap"
										style={{ background: 'transparent', paddingBottom: 16, border: 0 }}>
										<StarMap
											spaceDestinations={seed.spaceDestinations}
											spaceDestinationTypes={spaceDestinationTypes}
										/>
									</CollapsePanel>
								)}
							</Collapse>
						</div>
					)}
				</React.Fragment>
			</Spin>
		);
	}
}

const mapStateToProps = ({ seedBrowser }: ApplicationState) => ({
	seed: seedBrowser.details.seed,
	geyserTypes: seedBrowser.geyserTypes,
	gameUpgrades: seedBrowser.gameUpgrades,
	spaceDestinationTypes: seedBrowser.spaceDestinationTypes,
	elementNamesStatesColors: seedBrowser.elementBasicInfo
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
	getSeed: (request: SeedDetailsRequestModel) => dispatch(getSeed(request)),
	reportSeedInvalid: (request: AddInvalidSeedReportRequest) => dispatch(reportInvalidSeed(request))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SeedDetails));
