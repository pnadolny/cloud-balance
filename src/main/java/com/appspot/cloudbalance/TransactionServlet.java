package com.appspot.cloudbalance;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.ws.rs.*;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import static com.appspot.cloudbalance.Payee.DEFAULT_ACCOUNT;

@Path("transaction")
@Produces("application/json")
public class TransactionServlet {

    private static final Logger logger = Logger.getLogger(TransactionServlet.class
            .getCanonicalName());


    private class Tx {
        Long name;
        String payee;
        Double amount;
        String type;
        String date;
    }

    @GET
    public String doGet(
                        @QueryParam("month") Integer month, @QueryParam("year") Integer year) {

        Iterable<Entity> payees = Payee.getAllPayees();

        Iterable<Entity> transactionEntities = Transaction.list(month,year);
        Map<String, String> m = new HashMap<>();
        for (Entity p : payees) {
            m.put(p.getKey().getName(), (String) p.getProperty("type"));
        }
        List<Tx> transactions = new ArrayList<Tx>();
        for (Entity e : transactionEntities) {
            if (e.getParent()==null) {
                continue;
            }
            if (e.getParent().getParent()==null) {
                continue;
            }
            if (!DEFAULT_ACCOUNT.equals(e.getParent().getParent().getName())) {
                continue;
            }
            Tx tx = new Tx();
            tx.name = e.getKey().getId();
            tx.date = formatDate((Date) e.getProperty("date"));
            tx.amount = (Double) e.getProperty("amount");
            tx.payee = (String) e.getProperty("payee");
            tx.type = m.get(tx.payee);
            transactions.add(tx);
        }
        return new Gson().toJson(transactions);
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

    protected static String formatDate(Date d) {
        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat(Constants.ISO_DATE_FORMAT);
        df.setTimeZone(tz);
        return df.format(d);
    }


}
