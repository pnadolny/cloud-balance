package com.appspot.cloudbalance;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;

@SuppressWarnings("serial")
public class TransactionServlet extends BaseServlet {

	private static final Logger logger = Logger.getLogger(TransactionServlet.class
			.getCanonicalName());

	
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doGet(req, resp);
		logger.log(Level.INFO, "Obtaining Transactions");
		String searchBy = req.getParameter("transaction-searchby");
		String searchFor = req.getParameter("q");
		String searchParent = req.getParameter("p");
		PrintWriter out = resp.getWriter();
		if (searchFor == null || searchFor.equals("")) {
		
			Iterable<Entity> payees = Payee.getAllPayees(-1,null);
			
			List<Entity> transactions = new ArrayList<Entity>();
			for (Entity payee :payees) {
				logger.log(Level.INFO,payee.getKey().getName());
				Query q = new Query(Transaction.KIND);
				q.setAncestor(payee.getKey());
				for (Entity e: Util.getDatastoreServiceInstance().prepare(q).asIterable(FetchOptions.Builder.withDefaults())) {
					transactions.add(e);
				}
			}
			
			Collections.sort(transactions, new Comparator<Entity>() {
				@Override
				public int compare(Entity arg0, Entity arg1) {
					Date d1 = (Date)arg0.getProperty("date");
					Date d2 = (Date)arg1.getProperty("date");
		    		return d1.compareTo(d2);
				}});
			
				out.println(writeJSON(transactions,null,payees,"type"));
					
			
		} else if (searchBy == null && searchFor!=null) {
			out.println(Util.writeJSON(Transaction.findTransaction(searchParent,searchFor)));
		} 
	}

	public static String writeJSON(Iterable<Entity> entities, Map<String,String> moreValues, Iterable<Entity> parents, String valueToNormalize) {
		logger.log(Level.INFO, "creating JSON format object");
		StringBuilder sb = new StringBuilder();
		
		int i = 0;
		sb.append("{\"data\": [");
		for (Entity result : entities) {
			Map<String, Object> properties = result.getProperties();
			sb.append("{");
			if (result.getKey().getName() == null)
				sb.append("\"name\" : \"" + result.getKey().getId() + "\",");
			else
				sb.append("\"name\" : \"" + result.getKey().getName() + "\",");

			for (String key : properties.keySet()) {
				if ("java.util.Date".equals(properties.get(key).getClass()
						.getCanonicalName())) {
					
					SimpleDateFormat formatShort = new SimpleDateFormat(Constants.DATE_FORMAT);
					
					sb.append("\""
							+ key
							+ "\" : \""
							+ formatShort.format(properties.get(key)) + "\",");
				} else {
					sb.append("\"" + key + "\" : \"" + properties.get(key)
							+ "\",");
				}

			}
			if (moreValues!=null) {
			for (String key : moreValues.keySet()) {
				sb.append("\"" + key + "\" : \"" + moreValues.get(key)
						+ "\",");
			}
			}
			
			for (Entity p: parents) {
				
				if (p.getKey().equals(result.getParent())) {
					sb.append("\"" + valueToNormalize + "\" : \"" + p.getProperty(valueToNormalize)
							+ "\",");
				}
			}
			
			sb.deleteCharAt(sb.lastIndexOf(","));
			sb.append("},");
			i++;
		}
		if (i > 0) {
			sb.deleteCharAt(sb.lastIndexOf(","));
		}
		sb.append("]}");
		logger.log(Level.INFO, sb.toString());
		return sb.toString();
	}

	
	/**
	 * Creates entity and persists the same
	 */
	protected void doPut(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		logger.log(Level.INFO, "Creating transaction");
		
		String itemName = req.getParameter("name");
		String memo = req.getParameter("memo");
		String payeeName = req.getParameter("payee");
		String amount = req.getParameter("amount");
		String date = req.getParameter("date");
		String type = req.getParameter("transaction-type");
		if (req.getParameter("type")!=null) {
			type = req.getParameter("type");
		}
		Entity e = Transaction.createOrUpdateItem(payeeName, itemName, amount, date,memo,type);
		PrintWriter out = resp.getWriter();
		Gson gson = new Gson();
		out.println(gson.toJson(e));
		logger.log(Level.INFO, String.format("Creating transaction key with id of %s and name of %s", new Object[] {e.getKey().getId(), e.getKey().getName()}));
	}

	/**
	 * Delete the entity from the datastore. Throws an exception if there are
	 * any orders associated with the item and ignores the delete action for it.
	 */
	protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doDelete(req, resp);
		String itemKey = req.getParameter("id");
		String payeeName = req.getParameter("parentid");
		PrintWriter out = resp.getWriter();
		try {
			out.println(Transaction.deleteItem(payeeName, itemKey));
		} catch (Exception e) {
			out.println(Util.getErrorMessage(e));
		}

	}

	protected void doStar(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		String itemKey = req.getParameter("id");
		String payeeName = req.getParameter("parentid");
		PrintWriter out = resp.getWriter();
		try {
			out.println(Transaction.starItem(payeeName,itemKey));
		} catch (Exception e) {
			out.println(Util.getErrorMessage(e));
		}

	}
	/**
	 * Redirects to delete or insert entity based on the action in the HTTP
	 * request.
	 */
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doPost(req, resp);
		
		String action = req.getParameter("action");
		if (action.equalsIgnoreCase("star")) {
			doStar(req, resp);
		}else if (action.equalsIgnoreCase("put")) {
			doPut(req, resp);
			return;
		}
	}
}