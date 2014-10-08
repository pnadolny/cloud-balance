package com.appspot.cloudbalance;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
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
public class PayeeServlet extends BaseServlet {

	private static final Logger logger = Logger.getLogger(PayeeServlet.class
			.getCanonicalName());

	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		super.doGet(req, resp);
		logger.log(Level.INFO, "Obtaining payee listing");
		String dayOfYear = req.getParameter("dayOfYear");

		int iDayOfYear=0;
		if (dayOfYear==null) {
			iDayOfYear = GregorianCalendar.getInstance().get(GregorianCalendar.DAY_OF_YEAR);
		} else {
			iDayOfYear = Integer.valueOf(dayOfYear).intValue();
		}
		String year = req.getParameter("year");
		int iYear = Integer.valueOf(year).intValue();
		String searchFor = req.getParameter("q");
		PrintWriter out = resp.getWriter();
		if (searchFor == null || searchFor.equals("") || searchFor == "*") {
			out.println(writePayeesWithTotals(Payee.getAllPayees(),
					Transaction.KIND, iDayOfYear,iYear));
			return;
		}
		Entity payee = Payee.getPayee(searchFor);
		if (payee != null) {
			Set<Entity> result = new HashSet<Entity>();
			result.add(payee);
			out.println(writePayeesWithTotals(result,
					Transaction.KIND, iDayOfYear,iYear));
		}
	}

		
	public static String writePayeesWithTotals(Iterable<Entity> entities,
			String childKind, int iDayOfYear, int iYear) {
		StringBuilder sb = new StringBuilder();
		int i = 0;
		sb.append("[");
		for (Entity result : entities) {

			Map<String, Object> properties = result.getProperties();
			sb.append("{");
			if (result.getKey().getName() == null)
				sb.append("\"name\" : \"" + result.getKey().getId() + "\",");
			else
				sb.append("\"name\" : \"" + result.getKey().getName() + "\",");
			for (String key : properties.keySet()) {
				sb.append("\"" + key + "\" : \"" + properties.get(key) + "\",");
			}

			Double totalChild = Double.valueOf(0);
			Double lastAmount = Double.valueOf(0);
			Double thisMonth = Double.valueOf(0);
			Double lastMonth = Double.valueOf(0);
			Double average = Double.valueOf(0);
			int childCount = 0;
			GregorianCalendar gcMonth = new GregorianCalendar();
			gcMonth.set(GregorianCalendar.DAY_OF_YEAR, iDayOfYear);
			gcMonth.set(GregorianCalendar.YEAR, iYear);
			GregorianCalendar gcLastMonth = new GregorianCalendar();
			gcLastMonth.set(GregorianCalendar.DAY_OF_YEAR, iDayOfYear);
			gcLastMonth.set(GregorianCalendar.YEAR, iYear);
			gcLastMonth.add(Calendar.MONTH, -1);
			GregorianCalendar gcDb = new GregorianCalendar();
			
				Query q = new Query(Transaction.KIND);
				q.setAncestor(result.getKey());
				
				for (Entity en: Util.getDatastoreServiceInstance().prepare(q).asIterable(FetchOptions.Builder.withDefaults())) {
					gcDb.setTime(((Date) en.getProperty("date")));
					if (gcDb.after(gcMonth)) {
						continue;
					}
					if (gcDb.get(GregorianCalendar.YEAR) == gcMonth
							.get(GregorianCalendar.YEAR)) {
						if (gcDb.get(GregorianCalendar.MONTH) == gcMonth
								.get(GregorianCalendar.MONTH)) {
							thisMonth += (Double) en.getProperty("amount");
						}
					}
					if (gcDb.get(GregorianCalendar.YEAR) == gcLastMonth
							.get(GregorianCalendar.YEAR)) {
						if (gcDb.get(GregorianCalendar.MONTH) == gcLastMonth
								.get(GregorianCalendar.MONTH)) {
							lastMonth += (Double) en.getProperty("amount");
						}
					}
					totalChild += (Double) en.getProperty("amount");
					lastAmount = (Double) en.getProperty("amount");
					childCount++;
			
					
				}

			
			if (totalChild != 0) {
				average = totalChild / childCount;
			}

			sb.append("\"total\" : \"" + totalChild + "\",");
			sb.append("\"lastAmount\" : \"" + lastAmount + "\",");
			sb.append("\"average\" : \"" + average + "\",");
			sb.append("\"thisMonth\" : \"" + thisMonth + "\",");
			sb.append("\"lastMonth\" : \"" + lastMonth + "\",");
			sb.deleteCharAt(sb.lastIndexOf(","));
			sb.append("},");
			i++;
		}
		if (i > 0) {
			sb.deleteCharAt(sb.lastIndexOf(","));
		}
		sb.append("]");
		logger.log(Level.INFO,sb.toString());
		return sb.toString();
	}

	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		logger.log(Level.INFO, "Creating payee");
		PrintWriter out = resp.getWriter();
		String name = req.getParameter("name");
		String description = req.getParameter("description");
		String type = req.getParameter("type");
		try {
			Entity e = Payee.createOrUpdatePayee(name.trim(), description, type);
			Gson gson = new Gson();
			out.println(gson.toJson(e));
			logger.log(Level.INFO, String.format("Putting entity with id of %s and name of %s", new Object[] {e.getKey().getId(), e.getKey().getName()}));

		} catch (Exception e) {
			String msg = Util.getErrorMessage(e);
			out.print(msg);
		}

	}

	
    @Override
	protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
    	super.doDelete(req, resp);
		try {
			resp.getWriter().println(Payee.deletePayee(req.getParameter("id")));
		} catch (Exception e) {
			resp.getWriter().println(Util.getErrorMessage(e));
		}

    }

   

}