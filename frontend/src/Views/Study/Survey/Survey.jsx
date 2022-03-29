import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LandingHeader from "../Landing/LandingHeader/LandingHeader";
import IframeResizer from 'iframe-resizer-react'
import { Typography, Layout, Card } from 'antd';
import {useLocation} from "react-router-dom";

import queryString from 'query-string';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

function Survey(props) {
    const surveyLink = useSelector((state) => state.redCapLinks && state.redCapLinks.surveyLink);
    const surveyQueueLink = useSelector((state) => state.redCapLinks && state.redCapLinks.surveyQueueLink);
    const surveyStatus = useSelector((state) => state.redCapLinks && state.redCapLinks.isSurveyStarted);

    let location = useLocation();
    let params = queryString.parse(location.search)
    let isSurveyLink = params["isSurveyLink"] === "True";

    let link = surveyQueueLink;
    if (!surveyStatus || isSurveyLink) link = surveyLink;

    return (
		<>
			<LandingHeader />
			<Content className={"content"}>
				<div>
					<Title level={2}>eConsent Survey</Title>

					{/* <Card
                >
                    {
                        isSurveyLink || !props.isSurveyStarted ? (
                            <iframe 
                                src={surveyLink}
                                width="100%"
                                height="1000px"
                                frameborder="0"
                                scrolling="auto"
                            />
                        ) : (
                            <div>
                                <iframe 
                                    src={surveyQueueLink}
                                    width="100%"
                                    height="1000px"
                                    frameborder="0"
                                    scrolling="auto"
                                    style={{ marginTop: 20 }}
                                />
                            </div>
                            
                        )
                    }
                </Card> */}
					<IframeResizer
						src={link}
						style={{ width: "1px", minWidth: "100%" }}
						frameborder="0"
						height="1000px"
						inPageLinks
					/>
				</div>
			</Content>
		</>
	);
}

export default Survey;