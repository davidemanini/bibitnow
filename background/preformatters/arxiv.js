var BINPreformatter = ( function () {
        // a shadow as a "promise not to touch global data and variables". Must be included to be accepted!
        var BINData = null;
        var BINInteraction = null;
        var BINParser =  null;
        var window = null;
        var document = null;

        //preformatting function
        function preformatData(metaData, parser) {

                function fixMath(content, sym) {
                        var mathSymbols=sym.split(/[\ ]+;[\ ]+/);
                        if (sym != "" && mathSymbols != null ){
                                const length = mathSymbols.length;
                                if (length%2 == 0) {
                                        //index variable
                                        let idx = 0;
                                        for (let i = 0; i<length; ++i) {

                                                //get match and math symbol from misc
                                                let match = mathSymbols[i].trim();
                                                i++;
                                                let symbol = mathSymbols[i].trim();
                                                match += symbol;

                                                //continue only if not empty string
                                                if (symbol != "") {

                                                        let nextIdx = content.indexOf(match,idx);

                                                        //if found, replace by math
                                                        if (nextIdx != -1) {

                                                                //get new index in abstract after match
                                                                idx = nextIdx + match.length;

                                                                //replace string in abstract
                                                                content = content.slice(0,nextIdx) + "$" + symbol + "$" + content.slice(idx);

                                                                //get index in NEW abstract where to start searching from!
                                                                idx = nextIdx + symbol.length+3;
                                                        }
                                                }
                                        }
                                }
                        }
                        return content;
                }

                //fix beginning of title and abstract
                metaData["citation_abstract"] = metaData["citation_abstract"].replace(/^Abstract:[\ ]*/,"");
                metaData["citation_title"] = metaData["citation_title"].replace(/^Title:/,"");


                // ensures that this string separates the title from the abstract
                let separator = "A42h4";
                separator = separator.repeat(metaData["citation_abstract"].length + metaData["citation_title"].length);

                //fix math in title and abstract, math symbols saved in citation_misc
                let proc = metaData["citation_title"] + separator + metaData["citation_abstract"];
                proc = fixMath(proc, metaData["citation_misc"]);


                //reassign title and abstract
                let p = proc.split(separator);
                if (p != null && p.length == 2) {
                        metaData["citation_title"] = p[0];
                        metaData["citation_abstract"] = p[1];
                }

                //clear misc
                metaData["citation_misc"] = "";

                //manually set journal
                metaData["citation_journal_title"] = "ArXiv e-prints";
                metaData["citation_journal_abbrev"] = "arXiv";
                metaData["citation_database"] = "ArXiv e-prints";



                //preformat url
                metaData["citation_url"] = metaData["citation_url"].replace("/pdf/","/abs/");
        }

        // expose preformatting function and raw preformatting function
        return { preformatData : preformatData };

}());
