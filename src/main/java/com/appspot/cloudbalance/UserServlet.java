package com.appspot.cloudbalance;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@SuppressWarnings("serial")
public class UserServlet extends BaseServlet {

	private static final UserService userService = UserServiceFactory.getUserService();
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doGet(req, resp);
		Map<String, String> userData = new HashMap<String, String>();
		userData.put("userId", userService.getCurrentUser().getUserId());
		userData.put("email", userService.getCurrentUser().getEmail());
		userData.put("logoutURL", userService.createLogoutURL("/"));
		resp.getWriter().write(Util.writeJSON(userData));
	}

}