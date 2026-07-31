import pytest
from core import matcher

class TestNamesMatcher:

    @pytest.mark.parametrize(
            "text1,text2,expected",
            [
                ("Dinamo Zagrzeb", "Dinamo Zagreb",True),
                ("Thun", "FC Thun", True),
                ("Universitatea Craiova", "Universitatea Craiova", True),
                ("Górnik Zabrze","CFR Cluj", False)
            ],
        )
    def test_names_matching(self,text1,text2,expected):
        
        assert matcher.are_names_matching(text1,text2) == expected

    def test_single_empty_string(self):

        assert matcher.are_names_matching("FC Bostosani","") == False

    def test_both_empty_strings(self):

        assert matcher.are_names_matching("","") == False

class TestMatchesMatcher:

    @pytest.mark.parametrize(
                "match1,match2,expected",
                [
                    ({
                        "team1":"Dinamo Zagrzeb",
                        "team2":"Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    }, {
                        "team1":"Dinamo Zagreb",
                        "team2":"FC Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    },(True,False)),
                    ({
                        "team1":"Thun",
                        "team2":"Dinamo Zagrzeb",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    }, {
                        "team1":"Dinamo Zagreb",
                        "team2":"FC Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    },(True,True)),
                    ({
                        "team1":"Dinamo Zagrzeb",
                        "team2":"Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    }, {
                        "team1":"Dinamo Zagreb",
                        "team2":"FC Thun",
                        "start":"08-12-2026 12:00",
                        "category": "CS2"
                    },(False,False)),
                    ({
                        "team1":"Dinamo Zagrzeb",
                        "team2":"Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    }, {
                        "team1":"Dinamo Zagreb",
                        "team2":"FC Thun",
                        "start":"08-11-2026 14:00",
                        "category": "football"
                    },(False,False))
                ],
            )
    def test_matches_matching(self,match1,match2,expected):
            
        assert matcher.are_matches_matching(match1,match2) == expected

    def test_empty_inputs(self):

        assert matcher.are_matches_matching({
                        "team1":"Dinamo Zagrzeb",
                        "team2":"Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    },{}) == (False,False)

    def test_missing_key(self):

        assert matcher.are_matches_matching({
                                "team1":"Dinamo Zagrzeb",
                                "team2":"Thun",
                                "start":"08-12-2026 12:00",
                                "category": "football"
                            },{
                                "team1":"Dinamo Zagrzeb",
                                "team2":"Thun",
                                "category": "football"
                            }) == (False,False)

    def test_wrong_types(self):

        assert matcher.are_matches_matching({
                        "team1":"Dinamo Zagrzeb",
                        "team2":"Thun",
                        "start":"08-12-2026 12:00",
                        "category": "football"
                    },"") == (False,False)