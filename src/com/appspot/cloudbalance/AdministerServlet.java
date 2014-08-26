package com.appspot.cloudbalance;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.Entity;

public class AdministerServlet extends BaseServlet {


	private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doGet(req, resp);
	    Map<String, String> accountNameData = new HashMap<String, String>();
		for (Entity e: AccountName.getAccountName()) {
			accountNameData.put("accountName",(String) e.getProperty(AccountName.ACCOUNT_NAME));
		}
		if (accountNameData.isEmpty()) {
			accountNameData.put("accountName",Constants.DEFAULT_ACCOUNT_NAME);
		}
		 resp.getWriter().write(Util.writeJSON(accountNameData));
	}
	protected void doPut(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		PrintWriter out = resp.getWriter();
		try {
			AccountName.createOrUpdateItem(req.getParameter("accountName"));
		} catch (Exception e) {
			String msg = Util.getErrorMessage(e);
			out.print(msg);
		}
	}
	/**
	 * Redirect the call to doDelete or doPut method
	 */
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String action = req.getParameter("action");
		if (action.equalsIgnoreCase("put")) {
			doPut(req, resp);
			return;
		}
	}
}
