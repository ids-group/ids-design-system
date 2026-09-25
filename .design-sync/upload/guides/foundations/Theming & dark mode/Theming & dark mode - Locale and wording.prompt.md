# Theming & dark mode - locale and wording

Numbers and dates follow DsConfig.locale, then Angular's LOCALE_ID: chart values and percentages, the date picker, file sizes. Words follow DS_INTL: every string the library renders itself, English until an app provides provideDsIntl. Set both once, at the root; a factory returning a signal switches language live. The demo below provides locale: 'de-DE' and a few German words. A range of your own also receives (0, 0, 0) for an empty list, from the pager and from ds-table 's announcement.
