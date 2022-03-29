import React from "react";

import { Link, withRouter } from "react-router-dom";
import { Breadcrumb } from "antd";

function StudyBreadcrumb(props) {
	const studyId = props.match.params.studyId;
	const routePaths = props.routePaths;
	const getPath = (item) => {
		switch (item) {
			case "My Studies": {
				return `/my-studies`;
			}
			default:
				return `/study/${studyId}/landing`;;
		}
	};

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	return (
		<>
			<Breadcrumb>
				{routePaths.map((item, index) => (
					<Breadcrumb.Item key={item}>
						{/* no link if current page */}
						{index === routePaths.length - 1 ? (
							<>
								{parseInt(item)
									? item
									: item && capitalizeFirstLetter(item)}
							</>
						) : (
							<>
								<Link to={getPath(item)}>
									{parseInt(item)
										? item
										: item && capitalizeFirstLetter(item)}
								</Link>
							</>
						)}
					</Breadcrumb.Item>
				))}
			</Breadcrumb>
		</>
	);
}

export default withRouter(StudyBreadcrumb);
