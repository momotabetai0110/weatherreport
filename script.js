
//初期処理-----------------------------------------------------------------------------------------------------------
let weather_API = '';
let locate_API = '';

//緯度経度を取得
navigator.geolocation.getCurrentPosition(connect_API, geo_error);

function geo_error() {
    add_information('現在地の取得が許可されませんでした');
    connect_API();
}

//API接続準備
function connect_API(position) {
    const KEY = "625a424f8db3eaeb4a4e2b020bcb5df9";
    const weather_API_2 = `https://api.openweathermap.org/data/2.5/forecast?q=Tokyo&appid=${KEY}&lang=ja&units=metric`;

    if (position) {
        //位置情報がある場合
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        weather_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KEY}&lang=ja&units=metric`;
        locate_API = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${KEY}`;
        get_locate();
    } else {
        //位置情報がない場合
        weather_API = weather_API_2;
        add_information("現在地の情報がないため「東京」で表示します")
    }

}

//現在地の表示
async function get_locate() {
    try {
        const LOCATE_RESPONSE = await fetch(locate_API);
        const LOCATE_JSON = await LOCATE_RESPONSE.json();
        if (typeof LOCATE_JSON[0].local_names.ja === 'undefined') {
            add_information('現在地の取得に失敗しました')
        } else {
            document.getElementById('locate').innerHTML = "【現在地】" + LOCATE_JSON[0].local_names.ja;
        }
    } catch (error) {
        //エラーハンドリング
        add_information('予期しないエラー [01]');
    }

}


//日付リストの表示
let day_error_flag = 0
for (let i = 0; i < 6; i++) {
    try {
        const NOW_TIME = new Date();
        NOW_TIME.setDate(NOW_TIME.getDate() + i);
        const YEAR = NOW_TIME.getFullYear();
        const MONTH = add_0(NOW_TIME.getMonth() + 1);
        const DAY = NOW_TIME.getDate();
        const TEST = date_format(YEAR, MONTH, DAY, 1);

        document.getElementById("day" + i).innerHTML = TEST;
    } catch (error) {
        //エラーハンドリング
        if (day_error_flag === 0) {
            //エラー文は1回で済ます
            add_information('日付の取得に失敗しました');
            day_error_flag++;
        }
        document.getElementById("day" + i).innerHTML = `----------`;
    }

}

//現在時刻を表示
let time_error_flag = 0
function get_time() {
    try {
        const NOW_TIME = new Date();
        const NOW_MONTH = add_0(1 + NOW_TIME.getMonth());
        const NOW_YEAR = add_0(NOW_TIME.getFullYear());
        const NOW_DAY = add_0(NOW_TIME.getDate());
        const NOW_HOUR = add_0(NOW_TIME.getHours());
        const NOW_MINUTE = add_0(NOW_TIME.getMinutes());
        const NOW_SECOND = add_0(NOW_TIME.getSeconds());
        document.getElementById('time').innerHTML = `【現在時刻】${NOW_YEAR}/${NOW_MONTH}/${NOW_DAY} ${NOW_HOUR}:${NOW_MINUTE}:${NOW_SECOND}`;
    } catch (error) {
        //エラーハンドリング
        if (time_error_flag === 0) {
            document.getElementById('time').innerHTML = `【現在時刻】-----`;
            add_information('現在時刻の取得に失敗しました');
            time_error_flag++;
        }
    }
}
setInterval(get_time, 1000);

//天気予報機能-----------------------------------------------------------------------------------------------------

//日時をもとに天気データを表示
async function get_weather(select_time) {
    try {
        const WEATHER_RESPONSE = await fetch(weather_API);
        const WEATHER_JSON = await WEATHER_RESPONSE.json();
        const JSON_LIST = WEATHER_JSON.list;
        let temp_array = [];
        let feel_temp_array = [];
        let climate = '';
        let selected_time = select_time.innerHTML;
        selected_time = selected_time.replace(/\//g, '-')
        for (let i = 0; i < JSON_LIST.length; i++) {
            //選択した日付の気温を配列に追加
            if (JSON_LIST[i].dt_txt.startsWith(selected_time)) {
                temp_array.push(JSON_LIST[i].main.temp);
                feel_temp_array.push(JSON_LIST[i].main.feels_like);
            }
            //選択した日付の12:00の天気を取得
            if (JSON_LIST[i].dt_txt === selected_time + " 12:00:00") {
                climate = JSON_LIST[i].weather[0].description;
                //天気のみ時間によっては用意されていない可能性があるためエラーハンドリングを追加
                if (typeof climate === 'undefined') {
                    document.getElementById('weather1').innerHTML = `天気: -----------`;
                    add_information('天気の取得に失敗しました');
                } else {
                    document.getElementById('weather1').innerHTML = `天気: ${climate}`;

                }
            }
        };
        const MAX_TEMP = Math.max(...temp_array);
        const MIN_TEMP = Math.min(...temp_array);
        const AVG_TEMP = get_avg(temp_array);
        const AVG_FEEL_TEMP = get_avg(feel_temp_array);
        document.getElementById('weather2').innerHTML = `最高気温: ${MAX_TEMP}℃`;
        document.getElementById('weather3').innerHTML = `最低気温: ${MIN_TEMP}℃`;
        document.getElementById('weather4').innerHTML = `平均気温: ${AVG_TEMP}℃`;
        document.getElementById('weather5').innerHTML = `平均気温(体感): ${AVG_FEEL_TEMP}℃`;
        document.getElementById('day_view').innerHTML = select_time.innerHTML;
    } catch (error) {
        add_information('気温の取得に失敗しました');
    }

}


//時刻を0埋めする
function add_0(time) {
    return String(time).padStart(2, '0')
}

//配列の平均を求める
function get_avg(array) {
    let avg = 0;
    let = sum = 0;
    array.forEach(element => {
        sum += element;
        avg = sum / array.length;
    });
    return avg.toFixed(2);
}

//時刻のフォーマット変換
function date_format(year, month, day, format_type) {
    month = add_0(month);
    day = add_0(day);
    let date = '';
    if (format_type === 1) {
        date = `${year}/${month}/${day}`;
    } else {
        date = `${year}-${month}-${day}`;
    }
    return date;
}

//インフォメーション追加
function add_information(information_text) {
    const information_view = document.getElementById('information_view');
    const new_information = document.createElement('div');
    new_information.innerText = information_text;
    new_information.id = information
    information_view.appendChild(new_information);
}