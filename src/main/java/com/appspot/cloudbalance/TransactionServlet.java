package com.appspot.cloudbalance;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.text.DateFormat;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;

@Path("transaction")
@Produces("application/json")
public class TransactionServlet {

    private static final Logger logger = Logger.getLogger(TransactionServlet.class
            .getCanonicalName());

    protected static String formatDate(Date d) {

        TimeZone tz = TimeZone.getTimeZone("UTC");

        DateFormat df = new SimpleDateFormat(Constants.ISO_DATE_FORMAT);

        df.setTimeZone(tz);

        return df.format(d);

    }

    private static String writeJSON(Iterable<Entity> entities, Map<String, String> moreValues, Iterable<Entity> parents, String valueToNormalize) {
        logger.log(Level.INFO, "creating JSON format object");
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
                if (properties.get(key) == null) {
                    sb.append("\"" + key + "\" : \"\",");
                    continue;
                }
                if ("java.util.Date".equals(properties.get(key).getClass()
                        .getCanonicalName())) {

                    sb.append("\""
                            + key
                            + "\" : \""
                            + formatDate((Date) properties.get(key)) + "\",");
                } else {
                    sb.append("\"" + key + "\" : \"" + properties.get(key)
                            + "\",");
                }

            }
            if (moreValues != null) {
                for (String key : moreValues.keySet()) {
                    if (properties.get(key) == null) {
                        sb.append("\"" + key + "\" : \"\",");
                        continue;
                    }

                    sb.append("\"" + key + "\" : \"" + moreValues.get(key)
                            + "\",");
                }
            }

            for (Entity p : parents) {

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
        sb.append("]");
        logger.log(Level.INFO, sb.toString());
        return sb.toString();
    }

    @GET
    public String doGet(@QueryParam("transaction-searchby") String searchBy,
                        @QueryParam("q") String searchFor, @QueryParam("p") String searchParent) {


        if (searchFor == null || searchFor.equals("")) {
            Iterable<Entity> payees = Payee.getAllPayees();


            List<Entity> transactions = new ArrayList<Entity>();

            for (Entity payee : payees) {
                logger.log(Level.INFO, payee.getKey().getName());
                Query q = new Query(Transaction.KIND);
                q.setAncestor(payee.getKey());
                for (Entity e : Util.getDatastoreServiceInstance().prepare(q).asIterable(FetchOptions.Builder.withDefaults())) {
                    transactions.add(e);
                }
            }
            Collections.sort(transactions, new Comparator<Entity>() {
                @Override
                public int compare(Entity arg0, Entity arg1) {
                    Date d1 = (Date) arg0.getProperty("date");
                    Date d2 = (Date) arg1.getProperty("date");
                    return d1.compareTo(d2);
                }
            });
            return writeJSON(transactions, null, payees, "type");
        } else if (searchBy == null && searchFor != null) {
            return Util.writeJSON(Transaction.findTransaction(searchParent, searchFor));
        }
        return "";
    }

    @PUT
    public String doPut(@QueryParam("name") String itemName, @QueryParam("memo") String memo,
                        @QueryParam("payee") String payeeName, @QueryParam("amount") String amount, @QueryParam("date") String date,
                        @QueryParam("transaction-type") String type) {


        Entity e = Transaction.createOrUpdateItem(payeeName, itemName, amount, date, memo, type);
        logger.log(Level.INFO, String.format("Creating transaction key with id of %s and name of %s", new Object[]{e.getKey().getId(), e.getKey().getName()}));

        Gson gson = new Gson();
        return gson.toJson(e);

    }

    @DELETE
    public String doDelete(@QueryParam("id") String itemKey, @QueryParam("parentid") String payeeName)
            throws ServletException, IOException {
        try {
            return Transaction.deleteItem(payeeName, itemKey);
        } catch (Exception e) {
            return Util.getErrorMessage(e);
        }

    }


}
