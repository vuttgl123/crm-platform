package com.crm.sales.forecast.application.service;

import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.time.ZoneId;

import com.crm.sales.forecast.application.dto.ForecastPeriodContext;
import com.crm.sales.forecast.domain.ForecastPeriodPreset;
import org.springframework.stereotype.Component;

@Component
public class ForecastPeriodResolver {

	public ForecastPeriodContext resolve(ForecastPeriodPreset preset, String timezoneStr) {
		ZoneId zoneId;
		try {
			zoneId = (timezoneStr != null && !timezoneStr.isBlank()) ? ZoneId.of(timezoneStr) : ZoneId.of("UTC");
		} catch (Exception e) {
			zoneId = ZoneId.of("UTC");
		}

		LocalDate today = LocalDate.now(zoneId);
		LocalDate fromDate;
		LocalDate toDate;

		ForecastPeriodPreset actualPreset = preset != null ? preset : ForecastPeriodPreset.THIS_MONTH;

		switch (actualPreset) {
			case THIS_QUARTER -> {
				int monthValue = today.getMonthValue();
				int quarterStartMonth = ((monthValue - 1) / 3) * 3 + 1;
				fromDate = LocalDate.of(today.getYear(), quarterStartMonth, 1);
				YearMonth endYearMonth = YearMonth.of(today.getYear(), quarterStartMonth + 2);
				toDate = endYearMonth.atEndOfMonth();
			}
			case THIS_YEAR -> {
				fromDate = LocalDate.of(today.getYear(), Month.JANUARY, 1);
				toDate = LocalDate.of(today.getYear(), Month.DECEMBER, 31);
			}
			case THIS_MONTH -> {
				fromDate = today.withDayOfMonth(1);
				toDate = today.withDayOfMonth(today.lengthOfMonth());
			}
			default -> {
				fromDate = today.withDayOfMonth(1);
				toDate = today.withDayOfMonth(today.lengthOfMonth());
			}
		}

		return new ForecastPeriodContext(
				actualPreset,
				fromDate.toString(),
				toDate.toString(),
				zoneId.getId()
		);
	}
}
