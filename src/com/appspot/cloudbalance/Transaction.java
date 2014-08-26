package com.appspot.cloudbalance;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;

public class Transaction {

	public static final String KIND = "Transaction";
	public static Entity createOrUpdateItem(String payeeName, String itemName,
			String amount, String date, String memo, String type) {
		
		Date transactionDate = null;
		try {
			transactionDate = new SimpleDateFormat(Constants.DATE_FORMAT).parse(date);
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		Double transactionAmount = Double.valueOf(amount);
		if ("w".equals(type)) {
			transactionAmount = transactionAmount * -1;
		}
		
		Entity payee = Payee.getPayee(payeeName);
		Entity item =null;
		if (itemName == null || "".equals(itemName)) {
			item = new Entity(KIND, payee.getKey());
			item.setProperty("date", transactionDate);
			item.setProperty("memo", memo);
			item.setProperty("payee", payeeName);
			item.setProperty("amount", transactionAmount);
			item.setProperty("marked", "n");
		} else {
			Key key = KeyFactory.createKey(payee.getKey(), KIND, Long.valueOf(itemName).longValue());
			item = Util.findEntity(key);
			if (amount != null && !"".equals(amount)) {
				item.setProperty("amount", transactionAmount);
				item.setProperty("date", transactionDate);
				item.setProperty("memo",memo);
			}
		}
		Util.persistEntity(item);
		return item;
	}
	
	public static Entity findTransaction(String payeeName, String itemName) {
		Entity payee = Payee.getPayee(payeeName);
		Key key = KeyFactory.createKey(payee.getKey(), KIND, Long.valueOf(itemName).longValue());
		return Util.findEntity(key);
	}

	
	public static Iterable<Entity> getAllTransactions(Query.SortDirection direction, int offset) {
		Iterable<Entity> entities = Util.listEntities(KIND, null, null,direction, offset, null, null, null);
		return entities;
	}

	public static List<Entity> getTransactions(String name) {
		Query q = new Query(Transaction.KIND);
		
		q.setAncestor(KeyFactory.createKey(KIND, name));
		return Util.getDatastoreServiceInstance().prepare(q).asList(FetchOptions.Builder.withDefaults());
	}
	public static Iterable<Entity> getTransaction(String itemName) {
		Iterable<Entity> entities = Util.listEntities(KIND, "memo", itemName,Query.SortDirection.DESCENDING,0, null, null, null);
		return entities;
	}

	
	public static Iterable<Entity> findTransactionsByMonth(int dayOfYear, String searchByMonth) {

		GregorianCalendar gcBegin = new GregorianCalendar();
		gcBegin.set(GregorianCalendar.DAY_OF_YEAR, dayOfYear);
		gcBegin.set(GregorianCalendar.MONTH, Integer.parseInt(searchByMonth));
		gcBegin.set(GregorianCalendar.DAY_OF_MONTH, 1);
		Filter dateMinFilter = new FilterPredicate("date",  FilterOperator.GREATER_THAN_OR_EQUAL, gcBegin.getTime());
		
		GregorianCalendar gcEnd= new GregorianCalendar();
		gcEnd.set(GregorianCalendar.DAY_OF_YEAR, dayOfYear);
		gcEnd.set(GregorianCalendar.MONTH, Integer.parseInt(searchByMonth));
		gcEnd.set(GregorianCalendar.DAY_OF_MONTH, 31);
		Filter dateMaxFilter =  new FilterPredicate("date", FilterOperator.LESS_THAN_OR_EQUAL,gcEnd.getTime());
		
		Filter dateRangeFilter =
		  CompositeFilterOperator.and(dateMinFilter, dateMaxFilter);
		Query q = new Query(KIND).setFilter(dateRangeFilter);
		q.addSort("date",Query.SortDirection.ASCENDING);
		PreparedQuery pq = Util.getDatastoreServiceInstance().prepare(q);
		return pq.asIterable();
	}

	public static String deleteItem(String payeeName, String itemKey) {

		Entity entity = findTransaction(payeeName, itemKey);
		if (entity != null) {
			Util.deleteEntity(entity.getKey());
			return ("Transaction deleted successfully.");
		} else
			return ("Transaction not found");
	}

	public static String starItem(String payeeName, String itemKey) {
		Entity entity = findTransaction(payeeName, itemKey);
		if (entity != null) {
			if ("y".equals(entity.getProperty("marked"))) {
				entity.setProperty("marked", "n");
			} else {
				entity.setProperty("marked", "y");
			}
			Util.persistEntity(entity);

			return ("Transaction starred successfully.");
		} else
			return ("Transaction not found");
	}
}
