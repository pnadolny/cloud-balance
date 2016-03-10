package com.appspot.cloudbalance;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;

@Path("payee")
@Produces("application/json")
public class PayeeServlet {

    private static final Logger logger = Logger.getLogger(PayeeServlet.class
            .getCanonicalName());

    @GET
    public String doGet(@QueryParam("q") String searchFor, @QueryParam("dayOfYear") String dayOfYear, @QueryParam("year") String year) {
        logger.log(Level.INFO, "Obtaining payee listing");
        int iDayOfYear = 0;
        if (dayOfYear == null) {
            iDayOfYear = GregorianCalendar.getInstance().get(GregorianCalendar.DAY_OF_YEAR);
        } else {
            iDayOfYear = Integer.valueOf(dayOfYear).intValue();
        }
        int iYear = Integer.valueOf(year).intValue();
        if (searchFor == null || searchFor.equals("") || searchFor == "*") {
            return writePayeesWithTotals(Payee.getAllPayees(),
                    Transaction.KIND, iDayOfYear, iYear);
        }
        Entity payee = Payee.getPayee(searchFor);
        if (payee != null) {
            Set<Entity> result = new HashSet<Entity>();
            result.add(payee);
            return writePayeesWithTotals(result,
                    Transaction.KIND, iDayOfYear, iYear);
        }
        return null;

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

            for (Entity en : Util.getDatastoreServiceInstance().prepare(q).asIterable(FetchOptions.Builder.withDefaults())) {
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
        logger.log(Level.INFO, sb.toString());
        return sb.toString();
    }

    @PUT
    public String doPut(@QueryParam("name") String name, @QueryParam("description") String description, @QueryParam("type") String type) {
        try {
            Entity e = Payee.createOrUpdatePayee(name.trim(), description, type);
            logger.log(Level.INFO, String.format("Putting entity with id of %s and name of %s", new Object[]{e.getKey().getId(), e.getKey().getName()}));

            Gson gson = new Gson();
            return gson.toJson(e);

        } catch (Exception e) {
            return Util.getErrorMessage(e);
        }

    }


    @DELETE
    public String doDelete(@QueryParam("id") String id) {
        try {
            return Payee.deletePayee(id);
        } catch (Exception e) {
            return Util.getErrorMessage(e);
        }

    }


}