import { useState, useEffect } from "react";

/**
 * get whether this current view is on mobile (<576px)
 *
 * @returns boolean - isMobile
 */
function useMobile() {
	const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			const currentStatus = width < 576;
			if (isMobile !== currentStatus) {
				setIsMobile(currentStatus);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});

	return isMobile;
}

export default useMobile;
