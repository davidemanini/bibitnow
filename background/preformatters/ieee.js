var BINPreformatter = ( function () {

	// a shadow as a "promise not to touch global data and variables". Must be included to be accepted!
	var BINData = null;
	var BINInteraction = null;
	var BINParser =  null;
	var window = null;
	var document = null;
	
	//preformat raw data including raw RIS
	function preformatRawData(metaData, parser) {
		//fix title and journal, and make conference proceeding a journal (fix when proceedings are possible to cite)
		metaData["citation_download"] = metaData["citation_download"].replace(/JO[\t\ ]+[\-]+[\t\ ]+/,"JF - ").replace(/TI[\t\ ]+[\-]+[\t\ ]+/,"T1 - ").replace(/TY[\t\ ]+[\-]+[\t\ ]+CONF/,"TY - JOUR").trim();
	}
	
	//preformatting function
	function preformatData(metaData, parser) {
		//fix date string
		metaData["citation_date"] = metaData["citation_date"].replace(/(?:publication|of|date)/gi,"");
		
		//prefer static keywords and authors if available
		let download = metaData["citation_download"];
		if (download != null && typeof(download) == 'object') {
			if (metaData["citation_keywords"] != "") download["citation_keywords"] = "";
			if (metaData["citation_authors"] != "") download["citation_authors"] = "";
		}

		//fix static issn/isbn and type if isbn available
		let issn = metaData["citation_issn"].match(/is[sb]n[\:\s]*([0-9X\-]+)/i);
		if (issn != null && issn.length > 1) {
			issn = issn[1].trim();
			metaData["citation_issn"] = issn;
			if (issn.replace(/[\-]/g,"").length > 8) metaData["citation_type"] = "book";
		} else {
			metaData["citation_issn"] = "";
		}
		
		//abstract
		metaData["citation_abstract"] = metaData["citation_abstract"].replace(/^[\s]*abstract[\s]*/i,"");
		
		//fix type
		if (metaData["query_summary"]["citation_isbn"] == 1 && metaData["citation_isbn"].search(/^978/) != -1) {
			metaData["citation_type"] = "book";
			metaData["citation_journal_title"] = "";
		}
		
		//fix volume, issue, issn
		if (metaData["query_summary"]["citation_volume"] == 2) {
			download = metaData["citation_volume"];
			metaData["citation_volume"] = "";
			
			//fix volume
			issn = download.match(/volume[\:\s]*([^,]+)[,\)]/i);
			if (issn != null && issn.length > 1) {
				metaData["citation_volume"] = issn[1].trim();
			}
			
			//fix issue if necessary
			if (metaData["citation_issue"] == "") {
				issn = download.match(/issue[\:\s]*([^,]+),/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_issue"] = issn[1].trim();
				}
			}
		}
		
		//fix page
		if (metaData["query_summary"]["citation_firstpage"] == 2) {
			download = metaData["citation_firstpage"].replace(/^[^\:]*page[s]?[\s]*:/i,"").trim();
			if (download != "") {
				metaData["citation_firstpage"] = download;
			} else {
				metaData["citation_firstpage"] = "";
			}
		}
		
		//fix the rest by misc
		download = metaData["citation_misc"];
		if (download != "") {
			if (metaData["citation_authors"] == "") {
				issn = download.match(/author(?:\(s\)|)[\s]*:[\s]*([^\|]+)\|\-\|/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_authors"] = issn[1].trim();
				}
			}
			
			if (metaData["citation_date"] == "") {
				issn = download.match(/year[\s]*:[\s]*(.+?)\|\-\|/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_date"] = issn[1].trim();
				}
			}
			
			if (metaData["citation_publisher"] == "") {
				issn = download.match(/book[\s]+type[\s]*:[\s]*(.+?)\|\-\|/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_publisher"] = issn[1].trim();
				}
			}
			
			if (metaData["citation_type"] == "") {
				issn = download.match(/content[\s]+type[\s]*:[\s]*(.+?)\|\-\|/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_type"] = issn[1].trim();
				}
			}
			
			if (metaData["citation_keywords"] == "") {
				issn = download.match(/content[\s]+topic[s]*[\s]*:[\s]*(?:\|\-\||)[\s](.+?)(?:\|\-\||$)/i);
				if (issn != null && issn.length > 1) {
					metaData["citation_keywords"] = issn[1].trim();
				}
			}
		}
		
		//set database
		metaData["citation_database"] = "IEEE Xplore Digital Library";
	}
	
	// expose preformatting function
	return { preformatData : preformatData, preformatRawData: preformatRawData };

}());
