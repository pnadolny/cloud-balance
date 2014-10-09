package com.appspot.cloudbalance;

import java.io.IOException;
import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import com.google.appengine.api.NamespaceManager;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
public class NamespaceFilter implements Filter {

	private static final Logger logger = Logger.getLogger(NamespaceFilter.class
			.getCanonicalName());

	/**
	 * Enumeration of namespace strategies.
	 */
	enum NamespaceStrategy {

		/**
		 * Use the server name shown in the http request as the namespace name.
		 */
		GOOGLE_USER,

		/**
		 * Use the server name shown in the http request as the namespace name.
		 */
		SERVER_NAME,

		/**
		 * Use the Google Apps domain that was used to direct this URL.
		 */
		GOOGLE_APPS_DOMAIN,

		/**
		 * Use empty namespace.
		 */
		EMPTY
	}

	// The strategy to use for this instance of the filter.
	private NamespaceStrategy strategy = NamespaceStrategy.SERVER_NAME;

	// The filter config.
	private FilterConfig filterConfig;

	/*
	 * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
	 */
	@Override
	public void init(FilterConfig config) throws ServletException {
		this.filterConfig = config;
		String namespaceStrategy = config
				.getInitParameter("namespace-strategy");
		if (namespaceStrategy != null) {
			try {
				strategy = NamespaceStrategy.valueOf(namespaceStrategy);
				filterConfig.getServletContext().log(namespaceStrategy);
			} catch (IllegalArgumentException exception) {
				// Badly configured namespace-strategy
				filterConfig.getServletContext().log(
						"web.xml filter config \"namespace-strategy\" setting "
								+ "to \""
								+ namespaceStrategy
								+ "\" is invalid. Select "
								+ "from one of : "
								+ Arrays.asList(NamespaceStrategy.values())
										.toString());
				throw new ServletException(exception);
			}
		}
	}

	/*
	 * @see javax.servlet.Filter#destroy()
	 */
	@Override
	public void destroy() {
		this.filterConfig = null;
	}

	/*
	 * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
	 * javax.servlet.ServletResponse, javax.servlet.FilterChain)
	 */
	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {

		// If the NamespaceManager state is already set up from the
		// context of the task creator the current namespace will not
		// be null. It's important to check that the current namespace
		// has not been set before setting it for this request.
		if (NamespaceManager.get() == null) {
			switch (strategy) {

			case GOOGLE_USER: {
				UserService userService = UserServiceFactory.getUserService();
				if (userService.getCurrentUser() != null) {
					NamespaceManager.set(userService.getCurrentUser()
							.getUserId());
					 logger.log(Level.FINE, "Namepaces will be "
					 + userService.getCurrentUser().getUserId());
				}
				break;
			}

			case SERVER_NAME: {
				NamespaceManager.set(request.getServerName());
				break;
			}

			case GOOGLE_APPS_DOMAIN: {
				NamespaceManager.set(NamespaceManager.getGoogleAppsNamespace());
				break;
			}

			case EMPTY: {
				NamespaceManager.set("");
			}
			}
		}

		// chain into the next request
		chain.doFilter(request, response);
	}
}
