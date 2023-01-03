// 核心库，暂时使用Raphael过度，后续会替换为原生js
import Raphael from 'raphael'
// 图标库
import imgs from "./img"
import {bindDomEvent, exportBlob, exportTextFile} from "./util"

import {ElementData} from "./element"

// 内置html块
const DefaultHtmlTypes = {
    start: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
               <path d="M400.43759 732.273456a71.33239 71.33239 0 0 0 34.157473 8.810938 75.556813 75.556813 0 0 0 41.157944-12.069778l219.790665-144.837341a85.574729 85.574729 0 0 0 38.502593-72.418671 83.402169 83.402169 0 0 0-37.295615-70.608203l-221.842527-144.837341a72.41867 72.41867 0 0 0-74.591231-3.741631 84.488449 84.488449 0 0 0-41.761433 75.436115v289.674681a84.488449 84.488449 0 0 0 41.882131 74.591231z m42.002829-82.315889V374.163131l207.600188 135.664309v0.965582a13.156058 13.156058 0 0 1 0 2.293258z"></path>
               <path d="M149.989688 874.093352a509.948138 509.948138 0 1 0-109.714286-162.700613 513.206978 513.206978 0 0 0 109.714286 162.700613zM84.571489 512a428.11504 428.11504 0 1 1 427.511551 428.11504A428.597831 428.597831 0 0 1 84.571489 512z" ></path>
            </svg>`,
    end: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 0c282.752 0 512 229.248 512 512s-229.248 512-512 512S0 794.752 0 512 229.248 0 512 0z m0 85.333333C276.352 85.333333 85.333333 276.352 85.333333 512s191.018667 426.666667 426.666667 426.666667 426.666667-191.018667 426.666667-426.666667S747.648 85.333333 512 85.333333z m85.333333 256a85.333333 85.333333 0 0 1 85.333334 85.333334v170.666666a85.333333 85.333333 0 0 1-85.333334 85.333334h-170.666666a85.333333 85.333333 0 0 1-85.333334-85.333334v-170.666666a85.333333 85.333333 0 0 1 85.333334-85.333334h170.666666z"></path>
          </svg>`,
    // 网关（默认xor）
    xor: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M485.871492 47.174338c-9.168729-0.008066-18.33651 3.392487-25.137616 10.224908L57.381424 460.755494c-13.603161 13.602212-13.540056 36.674443 0.062631 50.276655l403.288872 403.286025c13.603161 13.606956 36.673969 13.66674 50.276655 0l403.352926-403.350079c13.602686-13.601737 13.539581-36.674918-0.064054-50.27713L511.009107 57.399246c-6.801106-6.801106-15.969361-10.217316-25.137615-10.224908z m-0.030841 59.805036l378.943153 378.946-378.943153 378.94173-378.943153-378.94173 378.943153-378.946zM344.31891 317.829311c-0.006643 0-4.560641 0.872083-4.564436 0.872083-0.004745 0-3.864114 2.615773-3.866961 2.615773l-14.581525 14.584847c-0.004745 0-2.661797 3.902546-2.663696 3.94857 0 0.004745-0.824161 4.498011-0.823686 4.498011 0 0.004745 0.886317 4.452936 0.88774 4.452935 0 0.004745 2.532741 3.94857 2.535588 3.94857l133.188084 133.184763-133.12403 133.12498v-0.041754c0 0.004745-2.661797 3.947621-2.663696 3.947621 0 0.004745-0.823686 4.499434-0.823686 4.499434 0 0.009489 0.886317 4.452936 0.88774 4.452936 0 0 2.533215 3.901597 2.535588 3.947621l14.582474 14.579627c0.004745 0.004745 3.990798 2.617197 3.994119 2.617197 0.004745 0 4.434431 0.872083 4.438227 0.872083 0.004745 0 4.497536-0.825584 4.500858-0.825584 0.004745 0 3.928642-2.663695 3.931014-2.663696l133.125929-133.128775 133.154871 133.156769c0.004745 0.004745 3.991273 2.617197 3.99412 2.617197 0.004745 0 4.434431 0.872083 4.438226 0.872083 0.004745 0 4.498011-0.827008 4.501807-0.827008 0.004745 0 3.926744-2.661797 3.929116-2.661797l14.582949-14.580577c0.004745-0.004745 2.597743-3.855573 2.600116-3.855573 0-0.004745 0.88774-4.545458 0.88774-4.591007 0-0.004745-0.886791-4.452936-0.888689-4.452936 0 0-2.59632-3.994119-2.599167-3.994119l-133.140163-133.142535 133.141112-133.139214c0.004745 0 2.596794-3.856048 2.599167-3.856048 0-0.004745 0.88774-4.544509 0.88774-4.544509 0-0.009489-0.886317-4.452936-0.887266-4.452935 0-0.004745-2.659899-3.94857-2.662746-3.94857l-14.582949-14.584372c-0.004745 0-3.863639-2.616248-3.86696-2.616248-0.004745 0-4.433957-0.873032-4.437753-0.873032-0.004745 0-4.561116 0.873032-4.564436 0.873032-0.004745 0-3.864588 2.616248-3.866961 2.616248l-133.143484 133.143484-133.203268-133.207538v-0.041754c-0.004745 0-3.927693-2.5242-3.931014-2.5242-0.004745 0-4.431584-0.871608-4.436804-0.872083h-0.000949z"></path>
                </svg>`,
    or: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M485.871492 47.174338c-9.168729-0.008066-18.33651 3.392487-25.137616 10.224908L57.381424 460.755494c-13.603161 13.602212-13.540056 36.674443 0.062631 50.276655l403.288872 403.286025c13.603161 13.606956 36.673969 13.66674 50.276655 0l403.352926-403.350079c13.602686-13.601737 13.539581-36.674918-0.064054-50.27713L511.009107 57.399246c-6.801106-6.801106-15.969361-10.217316-25.137615-10.224908z m-0.030841 59.805036l378.943153 378.946-378.943153 378.94173-378.943153-378.94173 378.943153-378.946z m-8.957589 186.164969l-0.000949 0.197381c0 0.004745-3.969921 0.735434-3.971345 0.735435-0.004745 0-3.251568 2.203456-3.25394 2.203455-0.004745 0-2.260393 3.350733-2.262291 3.350734 0 0.004745-0.763903 3.994119-0.765326 3.994119V439.440713l-96.147347-96.147348h0.004745c-0.004745 0-3.414787-2.203456-3.416211-2.203456-0.005694 0-3.803856-0.771969-3.832798-0.777188-0.037009 0.005694-3.945249 0.732113-3.947147 0.732113-0.004745-0.004745-3.352157 2.249005-3.35358 2.249006l-12.636658 12.629066-2.306416 3.397231c-0.004745 0-0.713608 3.901597-0.713609 3.901597 0 0.004745 0.765801 3.856048 0.766275 3.856048 0 0.004745 2.188747 3.397232 2.189696 3.397232l96.099901 96.101323H303.419279l-0.026571-0.032264c0 0.004745-3.953315 0.871608-3.955212 0.871608-0.004745 0.004745-3.250619 2.20393-3.252992 2.20393v-0.023249c-0.004745 0.004745-2.259918 3.352157-2.261816 3.352157-0.004745 0-0.764852 3.993171-0.766275 3.99317v17.871526s0.759158 4.040143 0.786677 4.040143c0 0.009489 2.251378 3.259634 2.251852 3.259635 0.004745 0 3.271022 2.203456 3.271971 2.203455 0.004745 0.009489 3.970396 0.872083 3.971819 0.872083h135.870285L343.2912 601.205873v-0.03606c-0.004745 0.004745-2.305942 3.397232-2.306891 3.397231-0.004745 0.004745-0.714557 3.901597-0.714557 3.901597 0 0.009015 0.767224 3.856048 0.767698 3.856048 0 0 2.196813 3.397232 2.189696 3.397232l12.638556 12.629066c0.004745 0.004745 3.453219 2.249005 3.454168 2.249005l3.847033 0.780509c0.005694 0 3.896852-0.734011 3.89875-0.734011 0 0 3.402451-2.295504 3.403874-2.295503l96.160633-96.160633v136.107996l-0.025147-0.026571c0 0.004745 0.787626 4.039194 0.786677 4.039195 0 0.004745 2.251378 3.259634 2.251378 3.259634 0.004745 0.004745 3.271022 2.203456 3.271971 2.203456 0 0 3.942402 0.826059 3.971819 0.872082l17.865832-0.004745c0.004745 0 4.048209-0.825584 4.050582-0.825584 0 0 3.250619-2.20393 3.252991-2.20393 0.004745-0.004745 2.24948-3.25916 2.251853-3.25916 0 0 0.774816-4.040143 0.776713-4.040143v-136.030657l96.091834 96.087564c-0.004745 0.009489 3.452271 2.249005 3.454168 2.249005 0.004745 0.004745 3.846084 0.735434 3.847508 0.735435 0.005694 0 3.896378-0.735434 3.89875-0.735435 0 0 3.401976-2.295504 3.404823-2.295503l12.632862-12.637132c0.004745 0 2.239041-3.352157 2.26751-3.352157 0-0.009489 0.778137-3.947621 0.759157-3.99317 0-0.004745-0.767698-3.856997-0.768647-3.856997-0.005694 0.004745-2.236194-3.442781-2.265612-3.442781l-95.851276-95.857444h135.679072c0.004745 0.004745 4.048209-0.826533 4.049633-0.826533 0.004745 0 3.251568-2.20393 3.252991-2.203931 0.004745-0.009015 2.249005-3.25916 2.251852-3.259159 0 0 0.774816-4.039194 0.776714-4.039195v-17.867255c0-0.004745-0.771494-3.947621-0.770071-3.99412-0.004745-0.004745-2.240465-3.350733-2.267984-3.350733-0.004745-0.004745-3.271496-2.20393-3.27292-2.20393 0 0.004745-4.036822-0.871608-4.03872-0.825584h-136.09044l96.283047-96.280201c0.004745-0.004745 2.238092-3.351682 2.266561-3.351682 0-0.009489 0.77956-3.947621 0.77956-3.947621 0-0.004745-0.766749-3.856522-0.767224-3.856522-0.004745-0.004745-2.299299-3.397232-2.300248-3.397231l-12.635709-12.638082c-0.004745 0-3.341244-2.249005-3.342667-2.249005-0.004745-0.004745-3.846084-0.734485-3.848456-0.734485-0.005694 0-3.960432 0.734011-3.961855 0.734011-0.004745 0.004745-3.352631 2.249005-3.35358 2.249005l-96.162531 96.161582V303.47838c0-0.004745-0.771494-3.948096-0.770071-3.994119-0.004745-0.009489-2.239516-3.351208-2.239516-3.351208-0.004745-0.004745-3.271496-2.203456-3.272445-2.203456-0.004745 0-4.048209-0.780509-4.049158-0.780509l-17.868679-0.004745z m-113.645937 47.167429l0.016132-0.002372h-0.029892l0.014235 0.002847z" p-id="3577"></path>
                </svg>`,
    and: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M485.871492 47.174338c-9.168729-0.008066-18.33651 3.392487-25.137616 10.224908L57.381424 460.755494c-13.603161 13.602212-13.540056 36.674443 0.062631 50.276655l403.288872 403.286025c13.603161 13.606956 36.673969 13.66674 50.276655 0l403.352926-403.350079c13.602686-13.601737 13.539581-36.674918-0.064054-50.27713L511.009107 57.399246c-6.801106-6.801106-15.969361-10.217316-25.137615-10.224908z m-0.030841 59.805036l378.943153 378.946-378.943153 378.94173-378.943153-378.94173 378.943153-378.946z m-10.34495 156.490911c0 0.004745-4.581992 0.872083-4.584365 0.872082-0.004745 0-3.752138 2.525623-3.754984 2.525624-0.004745 0.004745-2.608182 3.856048-2.610555 3.856047 0 0.004745-0.882521 4.590533-0.883944 4.590533V463.610402H275.283938l-0.03179-0.037009c0 0.004745-4.563488 1.010154-4.56586 1.010155-0.004745 0.004745-3.751663 2.525149-3.754036 2.525149l0.003796-0.046499c-0.004745 0.004745-2.608182 3.856048-2.610554 3.856048-0.004745 0-0.882996 4.591007-0.884893 4.591007v20.625371s0.876827 4.641776 0.908142 4.673566c0 0.004745 2.599167 3.764474 2.599167 3.764474 0.004745 0.004745 3.775387 2.525149 3.776811 2.525149 0.004745 0.004745 4.581518 1.009206 4.583415 1.009206h188.355615v188.264041l-0.029892-0.02752c0 0.004745 0.909092 4.673566 0.908617 4.673566 0 0.004745 2.598218 3.764 2.598218 3.764 0.004745 0.004745 3.776811 2.5242 3.777285 2.5242 0 0 4.550203 0.964131 4.584365 1.010629l20.6211-0.004745c0.005219 0 4.671668-0.964131 4.674515-0.964131 0 0 3.752138-2.5242 3.754985-2.5242 0.004745-0.004745 2.595371-3.765423 2.598218-3.765423 0 0 0.895332-4.659332 0.896755-4.659331V508.125523h188.309116c0.005219 0.004745 4.672142-0.963656 4.67404-0.963656 0.004745 0 3.753087-2.525149 3.754985-2.525149 0.004745-0.004745 2.595846-3.764474 2.598692-3.764474 0 0 0.894857-4.659332 0.896756-4.659332v-20.6211c0-0.004745-0.890587-4.545458-0.889164-4.591008-0.004745-0.004745-2.585882-3.856048-2.618146-3.856047-0.004745-0.004745-3.775862-2.5242-3.77681-2.5242 0 0.004745-4.659332-1.010629-4.661704-0.964605h-188.289188V275.364866c0-0.004745-0.891062-4.544034-0.889638-4.590059-0.004745-0.004745-2.585882-3.856997-2.585882-3.856996-0.004745-0.004745-3.774913-2.5242-3.775862-2.5242-0.004745 0-4.672617-0.918581-4.674514-0.918582l-20.624897-0.004744z"></path>
                </svg>`,
    // 聚合网关
    join: `<svg style="width: 100%;height: 100%;transform: rotate(45deg); vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <path d="M485.871492 47.174338c-9.168729-0.008066-18.33651 3.392487-25.137616 10.224908L57.381424 460.755494c-13.603161 13.602212-13.540056 36.674443 0.062631 50.276655l403.288872 403.286025c13.603161 13.606956 36.673969 13.66674 50.276655 0l403.352926-403.350079c13.602686-13.601737 13.539581-36.674918-0.064054-50.27713L511.009107 57.399246c-6.801106-6.801106-15.969361-10.217316-25.137615-10.224908z m-0.030841 59.805036l378.943153 378.946-378.943153 378.94173-378.943153-378.94173 378.943153-378.946zM344.31891 317.829311c-0.006643 0-4.560641 0.872083-4.564436 0.872083-0.004745 0-3.864114 2.615773-3.866961 2.615773l-14.581525 14.584847c-0.004745 0-2.661797 3.902546-2.663696 3.94857 0 0.004745-0.824161 4.498011-0.823686 4.498011 0 0.004745 0.886317 4.452936 0.88774 4.452935 0 0.004745 2.532741 3.94857 2.535588 3.94857l133.188084 133.184763-133.12403 133.12498v-0.041754c0 0.004745-2.661797 3.947621-2.663696 3.947621 0 0.004745-0.823686 4.499434-0.823686 4.499434 0 0.009489 0.886317 4.452936 0.88774 4.452936 0 0 2.533215 3.901597 2.535588 3.947621l14.582474 14.579627c0.004745 0.004745 3.990798 2.617197 3.994119 2.617197 0.004745 0 4.434431 0.872083 4.438227 0.872083 0.004745 0 4.497536-0.825584 4.500858-0.825584 0.004745 0 3.928642-2.663695 3.931014-2.663696l133.125929-133.128775 133.154871 133.156769c0.004745 0.004745 3.991273 2.617197 3.99412 2.617197 0.004745 0 4.434431 0.872083 4.438226 0.872083 0.004745 0 4.498011-0.827008 4.501807-0.827008 0.004745 0 3.926744-2.661797 3.929116-2.661797l14.582949-14.580577c0.004745-0.004745 2.597743-3.855573 2.600116-3.855573 0-0.004745 0.88774-4.545458 0.88774-4.591007 0-0.004745-0.886791-4.452936-0.888689-4.452936 0 0-2.59632-3.994119-2.599167-3.994119l-133.140163-133.142535 133.141112-133.139214c0.004745 0 2.596794-3.856048 2.599167-3.856048 0-0.004745 0.88774-4.544509 0.88774-4.544509 0-0.009489-0.886317-4.452936-0.887266-4.452935 0-0.004745-2.659899-3.94857-2.662746-3.94857l-14.582949-14.584372c-0.004745 0-3.863639-2.616248-3.86696-2.616248-0.004745 0-4.433957-0.873032-4.437753-0.873032-0.004745 0-4.561116 0.873032-4.564436 0.873032-0.004745 0-3.864588 2.616248-3.866961 2.616248l-133.143484 133.143484-133.203268-133.207538v-0.041754c-0.004745 0-3.927693-2.5242-3.931014-2.5242-0.004745 0-4.431584-0.871608-4.436804-0.872083h-0.000949z"></path>
                </svg>`,
    task: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0zM512 960c-249.6 0-448-198.4-448-448 0-249.6 198.4-448 448-448 249.6 0 448 198.4 448 448C960 761.6 761.6 960 512 960z"></path>
                <path d="M704 320c0-108.8-83.2-192-192-192C403.2 128 320 211.2 320 320s83.2 192 192 192C620.8 512 704 428.8 704 320zM512 448C441.6 448 384 390.4 384 320c0-70.4 57.6-128 128-128 70.4 0 128 57.6 128 128C640 390.4 582.4 448 512 448z"></path>
                <path d="M512 512c-179.2 0-320 115.2-320 256 0 19.2 12.8 32 32 32S256 787.2 256 768c0-108.8 115.2-192 256-192 140.8 0 256 83.2 256 192 0 19.2 12.8 32 32 32S832 787.2 832 768C832 627.2 691.2 512 512 512z"></path>
           </svg>`,
    reset: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M790.2 590.67l105.978 32.29C847.364 783.876 697.86 901 521 901c-216.496 0-392-175.504-392-392s175.504-392 392-392c108.502 0 206.708 44.083 277.685 115.315l-76.64 76.64C670.99 257.13 599.997 225 521.5 225 366.032 225 240 351.032 240 506.5 240 661.968 366.032 788 521.5 788c126.148 0 232.916-82.978 268.7-197.33z"></path>
                <path d="M855.58 173.003L650.426 363.491l228.569 32.285z"></path>
           </svg>`,
    imp: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M746.666667 469.333333H554.666667V213.333333l42.666666 42.666667 51.2 51.2L746.666667 213.333333l59.733333 59.733334-98.133333 98.133333 21.333333 21.333333 38.4 34.133334 42.666667 42.666666h-64zM512 213.333333v85.333334H298.666667v426.666666h426.666666v-213.333333h85.333334v298.666667H213.333333V213.333333h298.666667z"></path>
           </svg>`,
    exp: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M469.333333 162.133333h85.333334v469.333334c0 12.8-8.533333 21.333333-21.333334 21.333333h-42.666666c-12.8 0-21.333333-8.533333-21.333334-21.333333v-469.333334z"></path>
                <path d="M315.733333 392.533333L285.866667 362.666667c-8.533333-8.533333-8.533333-21.333333 0-29.866667l211.2-211.2c8.533333-8.533333 21.333333-8.533333 29.866666 0l44.8 44.8-226.133333 226.133333c-8.533333 8.533333-21.333333 8.533333-29.866667 0z"></path>
                <path d="M452.266667 166.4l44.8-44.8c8.533333-8.533333 21.333333-8.533333 29.866666 0l211.2 211.2c8.533333 8.533333 8.533333 21.333333 0 29.866667l-29.866666 29.866666c-8.533333 8.533333-21.333333 8.533333-29.866667 0L452.266667 166.4zM896 503.466667h-42.666667c-12.8 0-21.333333 8.533333-21.333333 21.333333v277.333333c0 12.8-8.533333 21.333333-21.333333 21.333334H213.333333c-12.8 0-21.333333-8.533333-21.333333-21.333334v-277.333333c0-12.8-8.533333-21.333333-21.333333-21.333333H128c-12.8 0-21.333333 8.533333-21.333333 21.333333v362.666667c0 12.8 8.533333 21.333333 21.333333 21.333333h768c12.8 0 21.333333-8.533333 21.333333-21.333333v-362.666667c0-12.8-8.533333-21.333333-21.333333-21.333333z"></path>
                <path d="M277.333333 588.8H149.333333v-85.333333h128c12.8 0 21.333333 8.533333 21.333334 21.333333v42.666667c0 10.666667-8.533333 21.333333-21.333334 21.333333zM874.666667 588.8h-128c-12.8 0-21.333333-8.533333-21.333334-21.333333v-42.666667c0-12.8 8.533333-21.333333 21.333334-21.333333h128v85.333333z"></path>
           </svg>`,
    picture: `<svg style="width: 100%;height: 100%;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M986.112 446.7712a38.4 38.4 0 0 0 38.4-38.4V144.128a140.9536 140.9536 0 0 0-140.8-140.8L140.7488 3.6864a140.9536 140.9536 0 0 0-140.8 140.8v735.3856a140.9536 140.9536 0 0 0 140.8 140.8l742.9632-0.4096a140.9536 140.9536 0 0 0 140.8-140.8V588.288c0-3.6864-1.1264-7.0144-2.0992-10.3936a37.8368 37.8368 0 0 0-11.9808-29.5936L785.8176 342.6304c-26.0096-23.8592-65.8432-24.576-96.2048 1.9968l-163.1232 182.8864-146.2272-84.9408a70.8608 70.8608 0 0 0-53.3504-13.6192 70.3488 70.3488 0 0 0-44.544 26.4704L179.6096 563.8656a38.4 38.4 0 0 0 55.7056 52.8384l103.8336-109.568 145.9712 84.8384c25.9584 20.0192 62.976 18.9952 91.5968-5.888l162.3552-182.1184 208.5888 191.0272v284.4672c0 35.2768-28.7232 64-64 64l-742.912 0.4096c-35.2768 0-64-28.7232-64-64V144.4864c0-35.2768 28.7232-64 64-64l742.9632-0.4096c35.2768 0 64 28.7232 64 64v264.2944c0 21.1968 17.2032 38.4 38.4 38.4z"></path>
                <path d="M264.4992 248.4224m-49.664 0a49.664 49.664 0 1 0 99.328 0 49.664 49.664 0 1 0-99.328 0Z"></path>
              </svg>`,
};

const defs = `
    <path d="M5,0 0,2.5 5,5 3.5,3 3.5,2z" id="connect-arrow-path" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>
`

// 创建指定颜色的marker
const createColorMarker = (svgDom, color) => {
    if (!color) return;

    // 箭头
    let id = `connect-arrow-${color}`;
    let marker = svgDom.querySelector("marker[id='" + id + "']");
    if (!marker) {
        marker = document.createElement("marker");
        marker.setAttribute("id", id);
        svgDom.querySelector("defs").appendChild(marker);
        marker = svgDom.querySelector("marker[id='" + id + "']");
        // marker.outerHTML = `
        //                     <marker id="${id}" fill="${color}" viewBox="0 0 20 20" refX="11" refY="10" markerWidth="10" markerHeight="10" orient="auto">
        //                         <path d="M 1 5 L 11 10 L 1 15 Z" stroke-width="1"></path>
        //                     </marker>
        //                 `;

        /**
         <marker id="raphael-marker-endclassic55-objt3f02" markerHeight="5" markerWidth="5" orient="auto" refX="2.5" refY="2.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"><use xlink:href="#raphael-marker-classic" transform="rotate(180 2.5 2.5) scale(1,1)" stroke-width="1.0000" fill="#409eff" stroke="none" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></use>
         </marker>
         * @type {string}
         */
        marker.outerHTML = `
                             <marker id="${id}" fill="${color}" markerHeight="5" markerWidth="5" orient="auto" refX="2.5" refY="2.5" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">
                                <use xlink:href="#connect-arrow-path" transform="rotate(180 2.5 2.5) scale(1,1)" stroke-width="1.0000" stroke="none" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></use>
                             </marker>
                        `;
    }

    // 条件连线样式
    id = `connect-condition-${color}`;
    marker = svgDom.querySelector("marker[id='" + id + "']");
    if (!marker) {
        marker = document.createElement("marker");
        marker.setAttribute("id", id);
        svgDom.querySelector("defs").appendChild(marker);
        marker = svgDom.querySelector("marker[id='" + id + "']");
        marker.outerHTML = `
                            <marker id="${id}" viewBox="0 0 20 20" refX="-15" refY="10" markerWidth="10" markerHeight="10" orient="auto">
                                <path d="M 0 10 L 8 6 L 16 10 L 8 14 Z" fill="#fff" stroke="${color}"  stroke-width="1"></path>
                            </marker>
                        `;
    }

}

/** 全局映射html块 */
const GlobalHTMLTypes = {...DefaultHtmlTypes};

/**
 * 注册html映射类型
 *
 * @param type
 * @param innerHTML
 */
export const registerHTML = (type, innerHTML) => {
    GlobalHTMLTypes[type] = innerHTML;
}

/**
 * 获取类型的html代码
 *
 * @param type
 * @param innerHTML
 */
export const getHTML = (type) => {
    return GlobalHTMLTypes[type];
}

/**
 * 拓展html节点的方法
 * @param type
 */
ElementData.prototype.setHtmlType = function (type) {
    let html = GlobalHTMLTypes[type];
    if(html) {
        this.updateHTML(html);
    } else {
        console.error(`html type ['${type}'] is not register`);
    }
}

const DefaultSettings = {
    linkName: "",
    nodeName: "节点名称",
    nodeBackgroundColor: "#fff",
    nodeStrokeWith: "3",
    themeColor: "#409eff",

    // 完成api样式配置
    // 环节执行完成设置背景色默认浅绿色
    completeColor: "green",
    // 完成状态的连线背景色默认浅绿色
    completeConnectColor: "green",
}

const NodeTypes = {
    Business: "Business"
}

/**
 * 默认配置项
 *
 * @type {{toolbar: boolean, dblclickElement(*=, *=): void, grid: boolean, background: null, clickElement(*, *), menu: boolean}}
 */
const defaultOption = {

    /** 显示网格背景 */
    grid: true,

    /** 自定义背景 */
    background: null,

    /** 画布宽度 */
    width: "1024px",

    /** 画布高度 */
    height: "768px",

    /** 显示节点拖拽菜单 */
    menu: true,

    /** 显示工具栏 */
    toolbar: false,

    /**
     * 启用属性的弹出框维护
     * 如果需要自定义维护，设置为false
     * */
    enablePropertyPop: true,

    /**
     * 连线风格： 折线段
     */
    pathStyle: "broken",

    /**
     * 是否支持平移
     */
    panable: true,

    /**
     * 是否可编辑
     */
    editable: true,

    /**
     * 是否生成UUID
     */
    uuid: true,

    /**
     * 默认条件类型
     */
    defaultConditionType: "Script",

    /**
     * 单击事件（可覆盖）
     * @param element
     * @param evt
     */
    clickElement(element, evt) {
    },

    /**
     * 双击元素事件可覆盖
     *
     * @param element
     * @param evt
     */
    dblclickElement(element, evt) {
    },

    /**
     * 点击空白
     * @param evt
     */
    clickBlank(evt) {

    },

    /**
     * 双击空白
     * @param evt
     */
    dblclickBlank(evt) {

    },

    /**
     * 右键事件
     *
     * @param evt
     */
    contextMenu(evt) {
    },

    /**
     * 连线创建时触发
     *
     * @param connect
     */
    onConnectCreated(connect) {

    },

    /**
     * 节点创建时触发
     *
     * @param node
     */
    onNodeCreated(node) {

    },

    /***
     * 配置项
     */
    settings: DefaultSettings
}

/**
 * 菜单html模板
 *
 * @type {string}
 */
const extensionTemplate = `
    <div class="flow-menu" style="display:none;z-index: 100;">
        <div class="menu-item" data-type="start" draggable="true" title="开始"></div>
<!--        <div>开始</div>-->
        <div class="menu-item" data-type="task" draggable="true" title="任务节点"></div>
<!--        <div>任务</div>-->
        <div class="menu-item" data-type="end" draggable="true" title="结束"></div>
        <!--        <div>结束</div>-->
        <div style="border: 1px dashed #dcdfe6; width: 40%;margin: 8px;opacity: .7;"></div>
        <div class="menu-item" data-type="xor" draggable="true" title="有且仅有一个满足条件的分支通过"></div>
<!--        <div>分支</div>-->
        <div class="menu-item" data-type="or" draggable="true" title="至少一个满足条件的分支通过,与汇聚网关组合使用"></div>
<!--        <div>分支</div>-->
        <div class="menu-item" data-type="and" draggable="true" title="所有分支强制通过,与汇聚网关组合使用"></div>
<!--        <div>分支</div>-->
        <div class="menu-item" data-type="join" draggable="true" title="汇聚网关"></div>
        <div style="border: 1px dashed #dcdfe6; width: 40%;margin: 8px;opacity: .7;"></div>
<!--        <div>聚合</div>-->
<!--        <div class="menu-item" data-type="selection"></div>-->
<!--        <div>圈选</div>-->
        <div class="menu-item" data-type="reset" title="重置"></div>
<!--        <div>重置</div>-->
        <div class="menu-item" data-type="imp" title="导入"></div>
<!--        <div>导入</div>-->
        <div class="menu-item" data-type="exp" title="导出"></div>
<!--        <div>导出</div>-->
<!--        <div class="menu-item" data-type="picture" title="导出图片"></div>-->
<!--        <div>图片</div>-->
    </div>
    <div class="flow-edit-input" contenteditable style="min-width: 50px; height: 24px; display: none;position: absolute;font-size: 13px;background: #fff;transform: translate(-50%, -50%);outline: 1px solid transparent;"></div>
    <div class="flow-popwin" style="display:none;font-size: 12px; position: fixed;background: #fff; right: 40px; width: 300px; overflow: auto;box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);z-index: 100;">
       <div>
            <span class="close-handle" style="color:red;float: right;cursor: pointer;" title="关闭">x</span>
            <h4>基本属性</h4>
       <div>
       <form class="flow-property-form">
       </form>
    </div>
    <input class="flow-import-input" type="file" accept=".json" style="position: absolute;display:none;opacity: 0; width: 0; height: 0; border: unset;"/>
`

// 连接创建时触发钩子
const onConnectCreated = (connect, instance) => {
    if (typeof instance.option.onConnectCreated == "function") {
        instance.option.onConnectCreated.call(instance, connect, instance);
    }
}

// 节点创建时触发钩子
const onNodeCreated = (node, instance) => {
    if (typeof instance.option.onNodeCreated == "function") {
        instance.option.onNodeCreated.call(instance, node, instance);
    }
}

/**
 * 定义流程设计类
 *
 * @author wangyunchao
 */
class GraphicDesign {

    /**
     * new构造器
     *
     * @param dom
     * @param option 配置项
     */
    constructor(dom, option) {
        // 平移：canvas.style.transform = "translate(100px, 10px)"
        if (typeof dom == "string") {
            dom = document.querySelector(dom);
        }
        this.option = Object.assign({}, defaultOption, option || {});
        if (!this.option.settings) {
            this.option.settings = DefaultSettings;
        } else {
            this.option.settings = Object.assign({}, DefaultSettings, this.option.settings);
        }
        let {width = '100%', height = '100%'} = this.option;
        dom.innerHTML = extensionTemplate;
        if (this.option.menu) {
            this.initMenu(dom.children[0]);
        }
        this.initInput(dom.querySelector(".flow-edit-input"));
        this.initPopwin(dom.querySelector(".flow-popwin"));
        this.initFileInput(dom.querySelector(".flow-import-input"));
        this.paper = new Raphael(dom, width, height);
        Object.assign(this.paper.canvas.style, {
            userSelect: "none",
            cursor: "grab"
        });
        // 连线颜色作为箭头的颜色
        this.connectColors = [this.option.settings.themeColor];
        // 初始化paper
        this.initPaper();
        this.dom = dom;
        // 初始化
        this.init();
        // 设置背景图片（网格）
        this.setStyles();
        // 节点和连线map
        this.elements = {};
        // 容器
        this.containers = {};
        // 圈选记录
        this.selections = [];
        // 设计模式
        this.designMode = 'Simple'
        // 当前选择元素
        this.selectElement = null;
        // 当前激活元素
        this.activeFromElement = null;
        // id池
        this.idPool = [];
        // 节点绑定在element中的属性集合

        let me = this;
        let setElementUUID = (element) => {
            return me.setElementUUID(element);
        }
        this.nodeDatas = {
            "gateway": "XOR",
            "handler": {},
            "uuid": setElementUUID,
            "meta": {}
        };
        // 连线绑定在element中的属性集合
        this.connectDatas = {
            "priority": 0,
            "conditionType": "Script",
            "script": "",
            "uuid": setElementUUID,
            "meta": {},
            "pathStyle": "broken"
        };

        this.initControlElements();

        this.translateX = 0;
        this.translateY = 0;
    };

    // 初始化及事件处理
    initControlElements() {
        let me = this;
        let resizeOnMove = function (dx, dy, x, y) {
            me.resizeOnMove(this, dx, dy, x, y);
        };
        let resizeOnStart = function () {
            me.resizeOnStart(this);
            me.dragingElement = this;
        };
        let resizeOnUp = function () {
            me.dragingElement = null;
        };

        let attr = {
            fill: "#ffffff",
            stroke: this.option.settings.themeColor
        }
        // 控制点信息
        let nw = this.nw = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'nw-resize'
        });
        let w = this.w = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'w-resize'
        });
        let sw = this.sw = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'sw-resize'
        });
        let n = this.n = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'n-resize'
        });
        let s = this.s = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 's-resize'
        });
        let ne = this.ne = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'ne-resize'
        });
        let e = this.e = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'e-resize'
        });
        let se = this.se = this.paper.rect(0, 0, 5, 5, 2.5, 2.5).attr({
            ...attr,
            cursor: 'se-resize'
        });
        nw.data("direction", "nw").data("diagonal", se).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        w.data("direction", "w").data("diagonal", e).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        sw.data("direction", "sw").data("diagonal", ne).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        n.data("direction", "n").data("diagonal", s).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        s.data("direction", "s").data("diagonal", n).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        ne.data("direction", "ne").data("diagonal", sw).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        e.data("direction", "e").data("diagonal", w).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();
        se.data("direction", "se").data("diagonal", nw).drag(resizeOnMove, resizeOnStart, resizeOnUp).hide();

        // drop active path elements
        attr = {
            "stroke": "#1DC967",
            "stroke-width": 2
        };
        this.dropNw = this.paper.path("").attr({...attr}).hide();
        this.dropNe = this.paper.path("").attr({...attr}).hide();
        this.dropSw = this.paper.path("").attr({...attr}).hide();
        this.dropSe = this.paper.path("").attr({...attr}).hide();

        // 虚线激活状态
        this.dashOuterPath = this.paper.path("").hide();
        this.dashOuterPath.node.setAttribute("stroke-dasharray", "2 2");

        // 圈选操作
        this.groupSelection = this.renderRect(0, 0, 0, 0, 4).attr({
            fill: "transparent",
            cursor: "move",
            "stroke-width": 2
        }).hide();
        this.groupSelection.node.setAttribute("stroke-dasharray", "8 8");
        this.dragableGroupSelection();

        // 工具栏
        // 连线工具（图片）
        this.linkTool = this.paper.image(imgs.sequenceflow, 0, 0, 16, 16).hide();
        this.linkTool.attr({
            opacity: .5,
            title: "拖拽到目标节点完成连线"
        }).mouseover(function () {
            this.attr("opacity", 1);
        }).mouseout(function () {
            this.attr("opacity", .5);
        });
        // 绑定事件 当拖动到可接受的节点时生成一个连线
        this.linkTool.drag(
            function (dx, dy, x, y, e) {
                // move
                me.linkToolOnDragMove(this, dx, dy, x, y, e);
            },
            // start
            function () {
                me.dragingElement = me.linkTool;
            },
            function () {
                // up
                me.linkToolOnDragUp(this);
                me.dragingElement = null;
            });

        // 快速追加下一个任务
        this.nextTaskTool = this.paper.image(imgs.task, 0, 0, 16, 16).attr({
            opacity: .5,
            title: "快速追加下一个任务",
            cursor: "pointer"
        }).mouseover(function () {
            this.attr("opacity", 1);
            me.dragingElement = {};
        }).mouseout(function () {
            this.attr("opacity", .5);
            me.dragingElement = null;
        }).hide();
        this.nextTaskTool.click(function (evt) {
            // create next task
            console.log(evt);
            me.nextNode();
        });

        // 快速追加分支任务
        this.nextSplitTool = this.paper.image(imgs.split, 0, 0, 16, 16).attr({
            opacity: .5,
            title: "快速追加分支任务",
            cursor: "pointer"
        }).mouseover(function () {
            this.attr("opacity", 1);
            me.dragingElement = {};
        }).mouseout(function () {
            this.attr("opacity", .5);
            me.dragingElement = null;
        }).hide();
        this.nextSplitTool.click(function (evt) {
            // create next task
            console.log(evt);
            me.nextSplit();
        });

        // 快速追加结束任务
        // this.nextEndTool = this.paper.image(imgs.tool_end, 0, 0, 16, 16).attr({
        this.nextEndTool = this.renderHTML("end", 0, 0, 16, 16).attr({
            opacity: .5,
            title: "快速追加结束任务",
            cursor: "pointer"
        }).mouseover(function () {
            this.attr("opacity", 1);
            me.dragingElement = {};
        }).mouseout(function () {
            this.attr("opacity", .5);
            me.dragingElement = null;
        }).hide();
        this.nextEndTool.click(function (evt) {
            // create next task
            console.log(evt);
            me.nextEnd();
        });
    };

    /**
     * 圈选拖动处理
     */
    dragableGroupSelection() {
        let me = this;
        let target = this.groupSelection;
        let dragContext = {ox: 0,oy: 0,dx: 0,dy: 0};
        target.drag((dx, dy) => {
            if (!me.option.editable) return;
            let location = {
                x: dragContext.ox + dx,
                y: dragContext.oy + dy
            };
            // if (location.x < 0 || location.y < 0) {
            //     return;
            // }
            target.attr(location);
            let panX = dx - dragContext.dx;
            let panY = dy - dragContext.dy;
            dragContext.dx = dx;
            dragContext.dy = dy;
            // update select elements position
            me.elementsPanTo(this.selections,  panX, panY);
        }, (event) => {
            if (!me.option.editable) return;
            me.dragingElement = target;

            // storing original coordinates
            dragContext.ox = target.attr("x");
            dragContext.oy = target.attr("y");
            target.attr({
                opacity: .8
            });
            target.attr("cursor", "move");
            me.hideEditElements(me.selectElement);
            return false;
        }, () => {
            if (!me.option.editable) return;
            me.dragingElement = null;
            target.attr({opacity: 1});
            dragContext = {ox: 0,oy: 0,dx: 0,dy: 0};
            // this.selections = [];
        });
    };

    /**
     * 追加任务
     */
    nextNode() {
        let fromNode = this.nextTaskTool.data("from");
        if (!fromNode) return;
        let {x, y, width, height} = fromNode.attrs;
        let centerY = y + height / 2;
        let nextNode = this.createNode(x + width + 100, y);
        nextNode.data("nodeType", NodeTypes.Business);
        let {height: h2} = nextNode.attrs;
        // 对齐
        nextNode.attr({y: centerY - h2 / 2});
        this.updateElements(nextNode);
        // 创建连线
        let path = this.createPath(fromNode, nextNode);
        this.hideEditElements(path);
    };

    /**
     * 追加分支
     */
    nextSplit() {
        let fromNode = this.nextTaskTool.data("from");
        if (!fromNode) return;
        let {x, y, width, height} = fromNode.attrs;
        let centerY = y + height / 2;

        let nextOneNode = this.createNode(x + width + 100, y);
        nextOneNode.data("nodeType", NodeTypes.Business);
        let {height: h1} = nextOneNode.attrs;
        // 对齐
        nextOneNode.attr({y: centerY - h1 / 2 - 100});
        this.updateElements(nextOneNode);
        // 创建连线1
        this.hideEditElements(this.createPath(fromNode, nextOneNode));

        let nextTwoNode = this.createNode(x + width + 100, y);
        nextTwoNode.data("nodeType", NodeTypes.Business);
        let {height: h2} = nextTwoNode.attrs;
        // 对齐
        nextTwoNode.attr({y: centerY - h2 / 2 + 100});
        this.updateElements(nextTwoNode);
        // 创建连线2
        this.hideEditElements(this.createPath(fromNode, nextTwoNode));
    };

    nextEnd() {
        let fromNode = this.nextTaskTool.data("from");
        if (!fromNode) return;
        let {x, y, width, height} = fromNode.attrs;
        let centerY = y + height / 2;
        let nextNode = this.createEndNode(x + width + 100, y);
        let {height: h2} = nextNode.attrs;
        // 对齐
        nextNode.attr({y: centerY - h2 / 2});
        // 创建连线
        this.createPath(fromNode, nextNode);
    };

    /**
     * 设置背景图片
     */
    setContainerStyle(style) {
        let container = this.paper.canvas.parentNode;
        if (style && typeof style == 'object') {
            Object.assign(container.style, style);
        }
    };

    /**
     * 设置背景图片
     * */
    setStyles() {
        let parentStyle = {
            position: "relative",
            overflow: this.option.overflow || "hidden"
        };
        if (this.option.background) {
            parentStyle.background = `${this.option.background}`;
        } else if (this.option.grid) {
            // 如果网格背景
            parentStyle.background = `url("${imgs.bg}")`;
        }
        // 设置bg图片
        this.setContainerStyle(parentStyle);
    };

    /** 初始化菜单 */
    initMenu(menuDom) {
        let me = this;
        this.menu = menuDom;
        Object.assign(menuDom.style, {
            position: "absolute",
            left: "10px",
            top: "10px",
            width: "64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "14px",
            // color: "#676768",
            color: this.option.settings.themeColor,
            padding: "5px 5px 20px",
            background: "hsla(0,0%,100%,.9)",
            boxShadow: "0 1px 4px rgba(0,0,0,.3)",
            userSelect: "none",
        });

        // 拖动上下文
        const dragContext = {
            dragmenu: false,
            type: null,
            element: null,
        };

        /** 拖动初始化 */
        const onDragStart = (event, domHandle) => {
            const {pageX, pageY} = event;

            let dragmenu = domHandle == menuDom;
            if (!dragmenu) {
                // 当前拖拽类型menu-item
                let type = domHandle.dataset.type;
                dragContext.type = type;
            }
            // 记录
            dragContext.px = pageX;
            dragContext.py = pageY;

            let {x, y, left, top} = me.dom.getBoundingClientRect()
            let offsetX = x || left;
            let offsetY = y || top;
            dragContext.offsetX = offsetX;
            dragContext.offsetY = offsetY;
            dragContext.dragmenu = dragmenu;

            if (dragmenu) {
                dragContext.left = Number(menuDom.style.left.replace("px", ""));
                dragContext.top = Number(menuDom.style.top.replace("px", ""));
            }
        }

        /**
         * 拖动中处理
         *
         * @param event
         */
        const onDragMove = (event) => {
            let {type, element, dragmenu, left, top} = dragContext;
            const {pageX, pageY} = event;
            let dx = pageX - dragContext.px;
            let dy = pageY - dragContext.py;
            if (dragmenu) {
                let newLeft = left + dx <= 0 ? 0 : left + dx;
                let newTop = top + dy <= 0 ? 0 : top + dy;
                // 更新菜单的位置
                Object.assign(menuDom.style, {
                    left: `${newLeft}px`,
                    top: `${newTop}px`,
                });
            } else {
                if (!element) {
                    let x = dragContext.px - dragContext.offsetX - 20,
                        y = dragContext.py - dragContext.offsetY - 20;
                    x -= me.translateX;
                    y -= me.translateY;

                    // 获取初始位置
                    if (type == "task") {
                        dragContext.element = element = me.createBusinessNode(x, y);
                    } else if (type == "start") {
                        dragContext.element = element = me.createStartNode(x, y);
                    } else if (type == "end") {
                        dragContext.element = element = me.createEndNode(x, y);
                    } else if (type == "xor") {
                        dragContext.element = element = me.createSplitNode(x, y);
                        dragContext.element.data("gateway", "XOR");
                    } else if (type == "or") {
                        dragContext.element = element = me.createSplitNode(x, y);
                        dragContext.element.updateHTML(DefaultHtmlTypes["or"]);
                        dragContext.element.data("gateway", "OR");
                    } else if (type == "and") {
                        dragContext.element = element = me.createSplitNode(x, y);
                        dragContext.element.updateHTML(DefaultHtmlTypes["and"]);
                        dragContext.element.data("gateway", "AND");
                    } else if (type == "join") {
                        dragContext.element = element = me.createJoinNode(x, y);
                    }
                    me.selectElement = element;
                    me.elementDragStart(element);
                }
                // 更新element的位置
                me.elementDragMove(element, dx, dy);
            }
        }

        /**
         * 拖动结束
         *
         */
        const onDragUp = (event) => {
            if (dragContext.element) {
                dragContext.element.attr({opacity: 1});
            }
            delete dragContext.type;
            delete dragContext.element;
            delete dragContext.dragmenu;
            document.removeEventListener("mousemove", onDragMove);
            document.removeEventListener("mouseup", onDragUp);
        }

        // 支持菜单拖拽移动
        if (typeof this.option.menu == "object" && this.option.menu.draggable) {
            Object.assign(menuDom.style, {
                cursor: "move"
            });
            // 拖动处理
            bindDomEvent(menuDom, "mousedown", function (event) {
                onDragStart(event, menuDom);
                document.addEventListener("mousemove", onDragMove);
                document.addEventListener("mouseup", onDragUp);
                event.stopPropagation();
                event.preventDefault();
            });
        }

        // 设置item背景图片
        menuDom.querySelectorAll(".menu-item").forEach(item => {
            let type = item.dataset.type;
            let width = 36, height = 36;
            if (type == "or" || type == "xor" || type == "and" || type == "join") {
                width = 45;
                height = 45;
            }
            Object.assign(item.style, {
                width: `${width}px`,
                height: `${height}px`,
                margin: "10px 0 4px 0"
            });
            if (type == "selection") {
                // item.style.cursor = `pointer`;
                // item.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=) 50% no-repeat`
                // 绑定全选事件
            } else if (type == "reset") {
                item.style.cursor = `pointer`;
                //item.style.color = this.option.settings.themeColor;
                item.innerHTML = DefaultHtmlTypes["reset"];
                bindDomEvent(item, "mousedown", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
                // 点击处理
                bindDomEvent(item, "click", function (event) {
                    me.reset();
                    event.stopPropagation();
                    event.preventDefault();
                });
            } else if (type == "exp") {
                item.style.cursor = `pointer`;
                //item.style.color = this.option.settings.themeColor;
                item.innerHTML = DefaultHtmlTypes["exp"];
                // 点击处理
                bindDomEvent(item, "mousedown", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
                // 点击处理
                bindDomEvent(item, "click", function (event) {
                    me.exportJSON();
                    event.stopPropagation();
                    event.preventDefault();
                });
            } else if (type == "imp") {
                item.style.cursor = `pointer`;
                //item.style.color = this.option.settings.themeColor;
                item.innerHTML = DefaultHtmlTypes["imp"];
                bindDomEvent(item, "mousedown", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
                // 点击处理
                bindDomEvent(item, "click", function (event) {
                    me.importJSON();
                    event.stopPropagation();
                    event.preventDefault();
                });
            } else if (type == "picture") {
                item.style.cursor = `pointer`;
                //item.style.color = this.option.settings.themeColor;
                item.innerHTML = DefaultHtmlTypes["picture"];
                bindDomEvent(item, "mousedown", function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });
                // 点击处理
                bindDomEvent(item, "click", function (event) {
                    me.exportImage();
                    event.stopPropagation();
                    event.preventDefault();
                });
            } else {
                Object.assign(item.style, {
                    cursor: "move"
                });
                // item.style.color = this.option.settings.themeColor;
                item.innerHTML = DefaultHtmlTypes[type];
                // 拖动处理
                bindDomEvent(item, "mousedown", function (event) {
                    onDragStart(event, item);
                    document.addEventListener("mousemove", onDragMove);
                    document.addEventListener("mouseup", onDragUp);
                    event.stopPropagation();
                    event.preventDefault();
                });
            }
        });
    };

    /**
     * 设置菜单的样式
     *
     * @param style
     */
    setMenuStyle(style) {
        if (typeof style != 'object') {
            style = {};
        }
        if (this.menu) {
            Object.assign(this.menu.style, style || {});
        }
    };

    /** 初始化input */
    initInput(inputDom) {
        let me = this;
        this.input = inputDom;
        bindDomEvent(inputDom, "input", function (evt) {
            let value = evt.target.innerText.replace(/[\s\r\n]/g, '');
            me.updateActiveText(value, false);
        });

        bindDomEvent(inputDom, "blur", function (evt) {
            // console.log(" blur ", evt.target.innerText.replace(/[\s\r\n]/g, ''));
            me.endInputEdit();
        });

        // 鼠标按下拦截组织冒泡平移事件
        bindDomEvent(inputDom, "mousedown", function (evt) {
            me.disablePan = true;
        });

        this.textElement = null;
    };

    // 弹出框设计
    initPopwin(popwinDom) {
        let me = this;
        this.popwin = popwinDom;
        Object.assign(popwinDom.style, {
            // display: "none",
            top: "150px",
            padding: "0 20px 20px",
            minHeight: "350px",
            display: "none"
        });

        // 关闭事件
        bindDomEvent(popwinDom.querySelector(".close-handle"), "click", function () {
            me.closePopwin();
        });

        // 表单dom
        this.propertyForm = popwinDom.querySelector(".flow-property-form");
    };

    /** 打开元素的属性编辑窗口 */
    openElementPropertyPop(element) {
        if (!this.option.editable) return;
        let me = this;
        let propertyModels = [];
        // 双击空白区域可维护流程信息
        if (!element) {
            propertyModels.push({
                label: "流程标识",
                value: me.processId || "",
                event: "input",
                key: "processId",
                html: `<input data-key="processId" placeholder="流程id"/>`,
                callback(value) {
                    me.processId = value;
                }
            }, {
                label: "流程名称",
                value: me.processName || "",
                event: "input",
                key: "processName",
                html: `<input data-key="processName" placeholder="流程名称"/>`,
                callback(value) {
                    me.processName = value;
                }
            });
        } else {
            let type = element.type;
            let nodeType = element.data("nodeType");
            propertyModels = [
                {
                    label: "元素ID",
                    value: element.id,
                    event: "input",
                    readonly: true,
                    key: "id",
                    html: `<input data-key="id"/>`,
                }
            ];
            if (type == "path") {
                let fromElementOutPaths = element.data("from").data("out");
                let uniqueConnect = Object.keys(fromElementOutPaths).length == 1;
                propertyModels.push({
                    label: "元素名称",
                    value: element.data("text").attr("text") || "",
                    event: "input",
                    key: "name",
                    html: `<input data-key="name" placeholder="请输入元素名称"/>`,
                    callback(value) {
                        me.setElementName(element, value);
                    }
                }, {
                    label: "连线样式",
                    value: element.data("pathStyle") || "",
                    event: "input",
                    key: "pathStyle",
                    html: `<select data-key="pathStyle">
                           <option value="broken">折线</option>
                           <option value="straight">直线</option>
<!--                           <option value="h2v">h2v</option>-->
<!--                           <option value="v2h">v2h</option>-->
<!--                           <option value="curve">曲线</option>-->
                       </select>`,
                    callback(value) {
                        if (value != element.data("pathStyle")) {
                            me.resetConnectPathData(element, value);
                            element.data("pathStyle", value);
                        }
                        // update path
                    }
                }, {
                    label: "分支策略",
                    value: element.data("conditionType") || "Script",
                    event: "change",
                    // readonly: uniqueConnect,
                    key: "conditionType",
                    html: `<select data-key="conditionType">
                           <option value="Always">Always</option>
                           <option value="Script">Script</option>
                           <option value="HandlerCall">HandlerCall</option>
                       </select>`,
                    callback(value) {
                        me.setConnectType(element, value);
                    }
                }, {
                    label: "脚本表达式",
                    value: element.data("script") || "",
                    event: "input",
                    key: "script",
                    html: `<textarea data-key="script"></textarea>`,
                    readonly: uniqueConnect,
                    callback(value) {
                        element.data("script", value);
                    }
                }, {
                    label: "优先级",
                    value: element.data("priority") || 0,
                    event: "input",
                    key: "priority",
                    html: `<input data-key="priority" type="number"/>`,
                    readonly: uniqueConnect,
                    callback(value) {
                        element.data("priority", !value ? 0 : Number(value));
                    }
                });
            } else {
                // 节点
                switch (nodeType) {
                    case "Start":
                    case "End":
                    case "Join": {
                        break;
                    }
                    case "Split": {
                        propertyModels.push({
                            label: "网关类型",
                            value: element.data("gateway") || "XOR",
                            event: "change",
                            key: "gateway",
                            html: `<select data-key="gateway">
                               <option value="XOR">条件</option>
                               <option value="OR">条件并行</option>
                               <option value="AND">并行</option>
                           </select>`,
                            callback(value) {
                                element.updateHTML(DefaultHtmlTypes[value.toLowerCase()]);
                                element.data("gateway", value);
                            }
                        });
                        break;
                    }
                    default: {
                        let handler = element.data("handler");
                        if (!handler) {
                            element.data("handler", handler = {});
                        }
                        if (element.data("text")) {
                            propertyModels.push({
                                label: "元素名称",
                                value: element.data("text").attr("text") || "",
                                event: "input",
                                key: "name",
                                html: `<input data-key="name" placeholder="请输入元素名称"/>`,
                                callback(value) {
                                    element.data("text").attr("text", value);
                                }
                            })
                        }
                        propertyModels.push({
                            label: "任务类型",
                            value: element.data("nodeType") || "Business",
                            event: "change",
                            key: "nodeType",
                            html: `<select data-key="nodeType">
                               <option value="Business">Business</option>
                               <option value="Service">Service</option>
                               <option value="Script">Script</option>
                               <option value="Manual">Manual</option>
                           </select>`,
                            callback(value) {
                                element.data("nodeType", value);
                            }
                        }, {
                            label: "是否异步执行",
                            value: handler.asynchronous || false,
                            event: "change",
                            key: "asynchronous",
                            checkbox: true,
                            html: `<input data-key="asynchronous" type="checkbox">`,
                            callback(value) {
                                handler.asynchronous = value;
                            }
                        }, {
                            label: "超时设置",
                            value: handler.timeout || 0,
                            event: "input",
                            key: "timeout",
                            html: `<input type="number" data-key="timeout" placeholder="单位为毫秒"/>`,
                            callback(value) {
                                handler.timeout = !value ? 0 : Number(value);
                            }
                        }, {
                            label: "延迟设置",
                            value: handler.delay || 0,
                            event: "input",
                            key: "delay",
                            html: `<input data-key="delay" type="number" placeholder="单位为毫秒"/>`,
                            callback(value) {
                                handler.delay = !value ? 0 : Number(value);
                            }
                        }, {
                            label: "循环迭代次数",
                            value: handler.iterate || 0,
                            event: "input",
                            key: "iterate",
                            html: `<input data-key="iterate" type="number"/>`,
                            callback(value) {
                                handler.iterate = !value ? 0 : Number(value);
                            }
                        }, {
                            label: "失败策略",
                            value: handler.policy || "Stop",
                            event: "change",
                            key: "policy",
                            html: `<select data-key="policy">
                                       <option value="Stop">终止</option>
                                       <option value="Continue">继续</option>
                                   </select>`,
                            callback(value) {
                                handler.policy = value;
                            }
                        });
                    }
                }
            }
        }

        let htmlCodes = [];
        let propertyModelMap = {}
        for (let propertyModel of propertyModels) {
            let {label, html, key} = propertyModel;
            htmlCodes.push(`
                 <div class="flow-form-item">
                    <div>${label}</div>
                    ${html}
                 </div>
            `);
            propertyModelMap[key] = propertyModel;
        }
        this.propertyForm.innerHTML = htmlCodes.join("");
        // 样式设置,事件处理
        this.propertyForm.querySelectorAll(".flow-form-item").forEach(item => {
            Object.assign(item.style, {
                display: "flex",
                flexDirection: "column",
                margin: "8px",
                lineHeight: "28px"
            });

            let inputDom = item.children[1];
            Object.assign(inputDom.style, {
                height: "28px",
                lineHeight: "28px",
                border: "1px solid #dcdfe6"
            });
            let key = inputDom.dataset.key;
            let propertyModel = propertyModelMap[key];

            if (propertyModel.checkbox) {
                if (propertyModel.value) {
                    inputDom.checked = true;
                }
            } else {
                inputDom["value"] = propertyModel.value;
            }
            if (propertyModel.readonly) {
                inputDom.setAttribute("disabled", "disabled");
            } else {
                bindDomEvent(inputDom, propertyModel.event, function (evt) {
                    let value = null;
                    if (propertyModel.checkbox) {
                        value = !!evt.target.checked;
                    } else {
                        value = evt.target.value;
                    }
                    propertyModel.callback(value);
                });
            }
        });
        this.popwin.style.display = "block";
        this.disablePan = true;
    };

    // 重置连线的风格
    resetConnectPathData(connectElement, pathStyle) {
        let fromElement = connectElement.data("from");
        let toElement = connectElement.data("to");
        this.resetPathData(connectElement, fromElement, toElement, pathStyle);
    };

    // 关闭弹出层窗口
    closePopwin() {
        if (this.popwin) {
            this.popwin.style.display = "none";
            this.disablePan = false;
        }
    };

    // 开始编辑
    beginInputEdit(element) {
        if (!this.option.editable) return;
        if (element.data("text")) {
            let textElement = element.data("text");
            this.textElement = textElement;
            let textValue = textElement.attr("text");
            // 位置
            let {x, y} = textElement.attrs;
            // 给input赋值
            this.input.innerHTML = textValue;
            // 设置input的位置
            Object.assign(this.input.style, {
                left: x + this.translateX + "px",
                top: y + this.translateY + "px",
                display: "block"
            });
            this.input.focus();
            textElement.hide();
        }
    };

    // 结束编辑
    endInputEdit() {
        // let value = this.input.innerText.replace(/[\s\r\n]/g, '');
        this.input.innerText = "";
        this.input.style.display = "none";
        if (this.textElement) {
            this.textElement.show();
        }
        this.disablePan = false;
    };

    // 导入初始化
    initFileInput(fileInput) {
        let me = this;
        this.fileInput = fileInput;
        bindDomEvent(fileInput, "change", (evt) => {
            me.onImportFile(evt);
        });
    };

    /**
     * 初始化
     */
    initData() {
        this.elements = {};
        this.containers = {};
        this.idPool = [];
        this.selections = [];
    };

    initPaper() {
        this.paper.canvas.querySelector("defs").innerHTML = defs;
        for (let color of (this.connectColors || [])) {
            createColorMarker(this.paper.canvas, color);
        }
    };

    /**
     *
     */
    init() {
        // 鼠标点击空地隐藏
        let me = this;
        // 单击事件
        bindDomEvent(me.paper.canvas, "click", (evt) => me.handleClickBlank(evt));
        // 右键事件
        bindDomEvent(me.paper.canvas, "contextmenu", (evt) => me.handleContextmenu(evt));
        // 绑定双击事件
        bindDomEvent(me.paper.canvas, "dblclick", (evt) => me.handleDblClickBlank(evt));

        this.handleDocumentKeyDown = (e) => {
            if (e.keyCode == 46) {
                // delete
                me.delSelectElement();
            } else if (e.keyCode == 8) {
                // backspace
                let active = document.activeElement;
                if (active.getAttribute && active.getAttribute("readonly") == "readonly") {
                    return false;
                }
            } else if (e.keyCode == 17) {
                // Control
                me.controlMode = true;
                me.paper.canvas.style.cursor = "crosshair";
                me.resetGroupSelection();
            }
        }

        this.handleDocumentKeyUp = (event) => {
            me.controlMode = false;
            me.paper.canvas.style.cursor = "grab";
        }

        // 键盘事件(在销毁时需要移除)
        document.addEventListener("keydown", this.handleDocumentKeyDown);
        document.addEventListener("keyup", this.handleDocumentKeyUp);
        if (this.option.panable) {
            const canvasDragContext = {
                moved: false
            };
            const onCanvasDragStart = (event) => {
                const {pageX, pageY} = event;
                canvasDragContext.px = pageX;
                canvasDragContext.py = pageY;
                if (me.controlMode) {
                    // 获取鼠标点击的坐标，设置为圈选的位置
                    let {x, y, left, top} = me.dom.getBoundingClientRect()
                    let start = {
                        x: pageX - (x || left || 0),
                        y: pageY - (y || top || 0)
                    };
                    this.groupSelection.data("start", start);
                } else {
                    canvasDragContext.translateX = me.translateX;
                    canvasDragContext.translateY = me.translateY;
                }
            }
            const onCanvasDragMove = (event) => {
                canvasDragContext.moved = true;
                const {pageX, pageY} = event;
                let dx = pageX - canvasDragContext.px;
                let dy = pageY - canvasDragContext.py;
                if (me.controlMode) {
                    let {x, y} = this.groupSelection.data("start");
                    let width = dx, height = dy;
                    if (dx < 0) {
                        x += dx;
                        width = -dx;
                    }
                    if (dy < 0) {
                        y += dy;
                        height = -dy;
                    }
                    // update selection rect
                    this.groupSelection.attr({
                        x,
                        y,
                        width,
                        height,
                        stroke: this.option.settings.themeColor
                    }).show();
                    // 设置圈选模式
                    me.groupSelectionMode = true;
                } else {
                    me.groupSelectionMode = false;
                    me.translateX = canvasDragContext.translateX + dx;
                    me.translateY = canvasDragContext.translateY + dy;
                    me.hideEditElements(this.selectElement);
                    me.translateTo(me.translateX, me.translateY);
                }
            }
            const onCanvasDragUp = (event) => {
                // panto and remove transform
                if (me.controlMode) {
                    // compute selections
                    me.selectionElements();
                } else {
                    if(this.groupSelectionMode) {
                        me.resetGroupSelection();
                        // me.groupSelectionMode = false;
                    }
                    me.panTo(me.translateX, me.translateY);
                }

                if(!canvasDragContext.moved) {
                    // only click
                    me.resetGroupSelection();
                }
                canvasDragContext.moved = false;
                document.removeEventListener("mousemove", onCanvasDragMove);
                document.removeEventListener("mouseup", onCanvasDragUp);
            }
            // 平移处理
            bindDomEvent(me.dom, "mousedown", function (event) {
                if (!me.dragingElement && !me.disablePan) {
                    onCanvasDragStart(event);
                    me.endInputEdit();
                    // me.resetGroupSelection();
                    document.addEventListener("mousemove", onCanvasDragMove);
                    document.addEventListener("mouseup", onCanvasDragUp);
                    // event.stopPropagation();
                    // event.preventDefault();
                }
            });
        }
    };

    /**
     * 圈选元素
     * */
    selectionElements() {
        let groupSelection = this.groupSelection;
        if(!groupSelection || !groupSelection.attrs) return;
        let { x,y,width,height} = groupSelection.attrs;
        if(!x || !y || !width || !height) return;

        let selections = this.selections = [];
        let elements = this.elements;
        let connectSets = [];
        for(let elementId in elements) {
            let element = elements[elementId];
            let type = element.type;
            if(type != "path") {
                let dropFlag = this.isDropContainer(element, groupSelection);
                if(dropFlag) {
                    selections.push(element);
                    let outLines = element.data("out");
                    for(let lineId in outLines || {}) {
                        if(!connectSets.includes(lineId)) {
                            connectSets.push(lineId);
                            selections.push(outLines[lineId]);
                        }
                    }
                    let inLines = element.data("in");
                    for(let lineId in inLines || {}) {
                        if(!connectSets.includes(lineId)) {
                            connectSets.push(lineId);
                            selections.push(inLines[lineId]);
                        }
                    }
                }
            }
        }

        if(this.selections.length == 0) {
            this.groupSelection.hide();
        }
    };

    /** 重置圈选 */
    resetGroupSelection() {
        this.groupSelection.hide();
        this.selections = [];
        this.groupSelectionMode = false;
    };

    // 单击事件
    handleClickBlank(evt) {
        this.option.clickBlank && this.option.clickBlank(evt);
        let selectElement = this.selectElement;
        if (selectElement) {
            this.hideEditElements(selectElement);
            this.selectElement = null;
        }
        if (this.activeFromElement) {
            this.activeFromElement = null;
        }
        // if(!this.selectionMode) {
        //     // 关闭圈选
        //     this.groupSelection.hide();
        //     this.selections = [];
        // }
        console.log("handleClickBlank ");
        this.closePopwin();
    };

    // 双击空白
    handleDblClickBlank(evt) {
        this.option.dblclickBlank && this.option.dblclickBlank(evt);
        // 内部编辑
        if (this.option.enablePropertyPop) {
            this.openElementPropertyPop();
        }
    };

    // 右键事件
    handleContextmenu(evt) {
        this.option.onContextMenu && this.option.onContextMenu(evt);
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    };

    setDesignMode(designMode) {
        this.designMode = designMode;
    };

    getDesignMode() {
        return this.designMode;
    };

    /**
     * 生成UUID
     */
    uuid() {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        let uuid = s.join("");
        return uuid;
    };

    /**
     * 根据html创建节点（以div作为容器）
     */
    renderHTML(type, x, y, width, height) {
        let html = null;
        if (!(html = GlobalHTMLTypes[type])) {
            console.error(`html type [${type}] is not register `);
            return;
        }
        let domEle = document.createElement("div");
        // 插入到指定节点
        this.dom.appendChild(domEle);
        domEle.innerHTML = html;
        domEle.style.position = "absolute";
        let element = new ElementData(domEle);
        element.attr({
            x: Number(x) || 0,
            y: Number(y) || 0,
            width: Number(width) || 0,
            height: Number(height) || 0
        });
        // this.initElement(element);
        return element;
    };

    /**
     * 绑定uuid（data属性）
     *
     * @param element
     */
    setElementUUID(element) {
        if (element && this.option.uuid) {
            let uuid = this.uuid();
            element.data("uuid", uuid);
            return uuid;
        }
        return null;
    };

    /**
     * 绘制通用矩形
     *
     * @param args
     * @returns {*}
     */
    renderRect(...args) {
        return this.paper.rect(...args);
    };

    /**
     * 绘制圆形
     *
     * @param x
     * @param y
     * @param r 半径
     * @returns {*}
     */
    renderCircle(x, y, r) {
        return this.paper.circle(x, y, r);
    };

    /**
     * 绘制图片
     *
     * @param args
     * @returns {*}
     */
    renderImage(...args) {
        return this.paper.image(...args);
    };

    /**
     * 绘制路径
     */
    renderPath(path, attrs) {
        return this.paper.path(path).attr(attrs);
    };

    getCoordinate(x1, y1, x2, y2, x) {
        if (x2 == x1) {
            console.error("call getCoordinate error for x2 == x1");
            return;
        }
        return x * (y2 - y1) / (x2 - x1) + (y1 * x2 - y2 * x1) / (x2 - x1);
    };

    /**
     * 获取直线的路径数据
     *
     * @param elementStart
     * @param elementEnd
     // * @param arrow
     * @returns {{}}
     */
    getLinePathData(elementStart, elementEnd/*, arrow*/) {
        let pathData = {};
        let pathD = "";

        let startX = elementStart.attr("x") - 5;
        let startY = elementStart.attr("y") - 5;
        let startWidth = elementStart.attr("width") + 10;
        let startHeight = elementStart.attr("height") + 10;

        let endX = elementEnd.attr("x") - 5;
        let endY = elementEnd.attr("y") - 5;
        let endWidth = elementEnd.attr("width") + 10;
        let endHeight = elementEnd.attr("height") + 10;

        // 计算2个重心连接与2个元素的交点 一共4个交点（分8中情况，8个方位）
        let startCenterX = startX + startWidth / 2;
        let startCenterY = startY + startHeight / 2;

        let endCenterX = endX + endWidth / 2;
        let endCenterY = endY + endHeight / 2;

        let pathStart = {};
        let pathEnd = {};
        if (endCenterX < startCenterX && endCenterY < startCenterY) {

            let horizontalStartPoint = {};
            horizontalStartPoint.y = startY;
            horizontalStartPoint.x =
                this.getCoordinate(startCenterY, startCenterX, endCenterY, endCenterX, horizontalStartPoint.y);

            if (horizontalStartPoint.x >= startX) {
                pathStart = horizontalStartPoint;
            } else {
                let verticalStartPoint = {};
                verticalStartPoint.x = startX;
                verticalStartPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalStartPoint.x);
                pathStart = verticalStartPoint;
            }

            let horizontalEndPoint = {};
            horizontalEndPoint.y = endY + endHeight;
            horizontalEndPoint.x = this.getCoordinate(startCenterY, startCenterX,
                endCenterY, endCenterX, horizontalEndPoint.y);
            if (horizontalEndPoint.x >= endX && horizontalEndPoint.x <= endX + endWidth) {
                pathEnd = horizontalEndPoint;
            } else {
                let verticalEndPoint = {};
                verticalEndPoint.x = endX + endWidth;
                verticalEndPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalEndPoint.x);
                pathEnd = verticalEndPoint;
            }

        } else if (endCenterX < startCenterX && endCenterY == startCenterY) {

            pathStart.x = startX;
            pathStart.y = startCenterY;

            pathEnd.x = endX + endWidth;
            pathEnd.y = endCenterY;

        } else if (endCenterX < startCenterX && endCenterY > startCenterY) {

            let horizontalStartPoint = {};
            horizontalStartPoint.y = startY + startHeight;
            horizontalStartPoint.x =
                this.getCoordinate(startCenterY, startCenterX, endCenterY, endCenterX, horizontalStartPoint.y);

            if (horizontalStartPoint.x >= startX) {
                pathStart = horizontalStartPoint;
            } else {
                let verticalStartPoint = {};
                verticalStartPoint.x = startX;
                verticalStartPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalStartPoint.x);
                pathStart = verticalStartPoint;
            }

            let horizontalEndPoint = {};
            horizontalEndPoint.y = endY;
            horizontalEndPoint.x = this.getCoordinate(startCenterY, startCenterX,
                endCenterY, endCenterX, horizontalEndPoint.y);
            if (horizontalEndPoint.x >= endX && horizontalEndPoint.x <= endX + endWidth) {
                pathEnd = horizontalEndPoint;
            } else {
                let verticalEndPoint = {};
                verticalEndPoint.x = endX + endWidth;
                verticalEndPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalEndPoint.x);
                pathEnd = verticalEndPoint;
            }

        } else if (endCenterX == startCenterX && endCenterY < startCenterY) {

            pathStart.x = startCenterX;
            pathStart.y = startY;

            pathEnd.x = endCenterX;
            pathEnd.y = endY + endHeight;

        } else if (endCenterX == startCenterX && endCenterY > startCenterY) {

            pathStart.x = startCenterX;
            pathStart.y = startY + startHeight;

            pathEnd.x = endCenterX;
            pathEnd.y = endY;

        } else if (endCenterX > startCenterX && endCenterY < startCenterY) {

            let horizontalStartPoint = {};
            horizontalStartPoint.y = startY;
            horizontalStartPoint.x =
                this.getCoordinate(startCenterY, startCenterX, endCenterY, endCenterX, horizontalStartPoint.y);

            if (horizontalStartPoint.x <= startX + startWidth) {
                pathStart = horizontalStartPoint;
            } else {
                let verticalStartPoint = {};
                verticalStartPoint.x = startX + startWidth;
                verticalStartPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalStartPoint.x);
                pathStart = verticalStartPoint;
            }

            let horizontalEndPoint = {};
            horizontalEndPoint.y = endY + endHeight;
            horizontalEndPoint.x = this.getCoordinate(startCenterY, startCenterX,
                endCenterY, endCenterX, horizontalEndPoint.y);
            if (horizontalEndPoint.x >= endX) {
                pathEnd = horizontalEndPoint;
            } else {
                let verticalEndPoint = {};
                verticalEndPoint.x = endX;
                verticalEndPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalEndPoint.x);
                pathEnd = verticalEndPoint;
            }


        } else if (endCenterX > startCenterX && endCenterY == startCenterY) {

            pathStart.x = startX + startWidth;
            pathStart.y = endCenterY;

            pathEnd.x = endX;
            pathEnd.y = endCenterY;

        } else {
            // endCenterX > startCenterX && endCenterY > startCenterY
            let horizontalStartPoint = {};
            horizontalStartPoint.y = startY + startHeight;
            horizontalStartPoint.x =
                this.getCoordinate(startCenterY, startCenterX, endCenterY, endCenterX, horizontalStartPoint.y);

            if (horizontalStartPoint.x <= startX + startWidth) {
                pathStart = horizontalStartPoint;
            } else {
                let verticalStartPoint = {};
                verticalStartPoint.x = startX + startWidth;
                verticalStartPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalStartPoint.x);
                pathStart = verticalStartPoint;
            }

            let horizontalEndPoint = {};
            horizontalEndPoint.y = endY;
            horizontalEndPoint.x = this.getCoordinate(startCenterY, startCenterX,
                endCenterY, endCenterX, horizontalEndPoint.y);
            if (horizontalEndPoint.x >= endX) {
                pathEnd = horizontalEndPoint;
            } else {
                let verticalEndPoint = {};
                verticalEndPoint.x = endX;
                verticalEndPoint.y = this.getCoordinate(startCenterX, startCenterY,
                    endCenterX, endCenterY, verticalEndPoint.x);
                pathEnd = verticalEndPoint;
            }
        }

        pathD += "M" + pathStart.x + "," + pathStart.y;
        pathD += "L" + pathEnd.x + "," + pathEnd.y;

        // // 箭头处理
        // if (arrow) {
        //     let x3 = pathEnd.x, y3 = pathEnd.y, Par = 10.0, slopy = Math.atan2((pathStart.y - pathEnd.y),
        //         (pathStart.x - pathEnd.x)), cosy = Math.cos(slopy), siny = Math.sin(slopy);
        //
        //     pathD += " L" + (Number(x3) + Number(Par * cosy - (Par / 2.0 * siny)))
        //         + "," + (Number(y3) + Number(Par * siny + (Par / 2.0 * cosy)));
        //
        //     pathD += " L"
        //         + (Number(x3) + Number(Par * cosy + Par / 2.0 * siny) + "," + (Number(y3) - Number(Par
        //             / 2.0 * cosy - Par * siny)));
        //     pathD += " L" + x3 + "," + y3;
        // }
        pathData.data = pathD;
        pathData.start = pathStart;
        pathData.end = pathEnd;
        return pathData;
    };

    distanceFromPointToLine(x0, y0, x1, y1, x2, y2) {
        // 求3个边长
        let a = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
        let b = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        let c = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
        // 根据海伦公式求3个点围成的面积
        // S=√[p(p-a)(p-b)(p-c)]
        let halfP = (a + b + c) / 2;
        let s = Math.sqrt(halfP * (halfP - a) * (halfP - b) * (halfP - c));
        let h = 2 * s / b;
        return h;
    };

    delSelectElement() {
        if (this.selectElement) {
            this.hideEditElements(this.selectElement);
            this.removeElement(this.selectElement);
            this.selectElement = null;
        }
    };

    removeElement(targetElement) {
        let type = targetElement.type;
        let dataObject = targetElement.data();
        if (type == "rect" || type == "image" || type == "html") {
            // 元素，注意需要移除关联的连线
            for (let i in dataObject) {
                let dataProp = dataObject[i];
                if (i != "container") {
                    dataProp && dataProp.remove && dataProp.remove();
                }
                if ((i == "in" || i == "out") && dataProp && dataProp instanceof Object) {
                    for (let j in dataProp) {
                        this.removeElement(dataProp[j]);
                        delete dataProp[j];
                    }
                }
            }
            let elementId = targetElement.id;

            // 删除元素时与子流程有关的需要特殊解除关系
            let dataType = dataObject["type"];
            let container = dataObject["container"];
            if (dataType == "mutiSubProcess" || dataType == "serviceGroup") {
                // 删除的是容器，获取所有的子节点先删除
                let containerObj = this.containers[targetElement.id];
                let childElements = containerObj.elements;
                for (let i in childElements) {
                    let childElement = childElements[i];
                    this.removeElement(childElement);
                }
                this.removeContainer(containerObj);
            } else {
                this.unregisterElement(elementId);
            }
            // 如果删除的元素时包含在container里面的子节点，解除关系
            if (container) {
                // 解除关系
                this.unbindElementFromContainer(targetElement, container);
            }
            // 最后删除元素
            targetElement.remove();

        } else if (type == "path") {
            // 连线，移除箭头、连线中的矩形、文本
            // 移除元素关系
            let fromElement = targetElement.data("from");
            let toElement = targetElement.data("to");

            if (fromElement && fromElement.data("out")) {
                let outLines = fromElement.data("out");
                delete outLines[targetElement.id];
            }

            if (toElement && toElement.data("in")) {
                let inLines = toElement.data("in");
                delete inLines[targetElement.id];
            }
            this.removePathRelationRects(targetElement);
            // targetElement.data("arrow").remove();
            targetElement.data("text").remove();

            let elementId = targetElement.id;
            targetElement.remove();
            this.unregisterElement(elementId);
        } else {

        }
    };

    /** 移除路径关联的rects */
    removePathRelationRects(targetElement) {
        // 比如折线
        let startElement = targetElement && targetElement.data("start");
        if (startElement) {
            let nextElement = startElement.data("right");
            startElement.remove();
            while (nextElement) {
                let temp = nextElement;
                let leftRect = temp.data("leftRect");
                leftRect.undrag();
                leftRect.remove();
                nextElement = nextElement.data("right");
                temp.undrag();
                temp.remove();
            }
        }
    };

    /**
     * 绑定选择事件
     *
     * @param targetElement
     */
    bindSelectEvent(targetElement) {
        // 添加单击事件
        let me = this;
        targetElement.click(function (e) {
            let elementType = targetElement.type;
            let selectElement = me.selectElement;
            if (selectElement) {
                me.hideEditElements(selectElement);
            }
            me.showEditElements(me.selectElement = targetElement);
            // 阻止冒泡
            e.stopPropagation();
            if (elementType != "path") {
                let activeFromElement = me.activeFromElement;
                if (activeFromElement && activeFromElement != targetElement) {
                    // 创建activeFromElement-->targetElement的连线
                    me.createLink(activeFromElement, targetElement);
                    me.activeFromElement = null;
                    return;
                }
            }
            me.option.clickElement && me.option.clickElement(targetElement, e);
        });

        if (targetElement.data('text')) {
            targetElement.data('text').click(function (e) {
                me.beginInputEdit(targetElement);
            });
            targetElement.data('text').dblclick(function (e) {
                // 点击文本直接修改文本，不再触发双击事件
                // me.option.dblclickElement && me.option.dblclickElement(targetElement, e);
                me.beginInputEdit(targetElement);
                e.stopPropagation();
            });
        }

        targetElement.dblclick(function (e) {
            e.stopPropagation();
            me.handleDblclickElement(targetElement, e);
        });
    };

    /**
     * 响应双击事件(不要主动调用)
     * @param element
     * @param evt
     */
    handleDblclickElement(element, evt) {
        this.option.dblclickElement && this.option.dblclickElement(element, evt);
        // 文本编辑
        this.beginInputEdit(element);
        // 内部编辑
        if (this.option.enablePropertyPop) {
            this.openElementPropertyPop(element);
        }
    };

    bindMouseOverOutEvent(targetElement) {
        let type = targetElement.type;
        let me = this;
        if (type == "rect" || type == "image" || type == "html") {
            let nodeType = targetElement.data("nodeType");
            if (nodeType != "Start") {
                targetElement.mouseover(function () {
                    me.dropNode = null;
                    if (!me.dragingLine) {
                        return;
                    }
                    me.showDropRect(targetElement);
                    me.dropNode = this;
                }).mouseout(function () {
                    me.hideDropRect();
                    this.attr("cursor", "default");
                    me.dropNode = null;
                });
            }
        }
    };

    showDropRect(targetElement) {
        let {dropNw, dropNe, dropSw, dropSe} = this;
        let {x, y, width, height} = targetElement.attrs;
        // 创建一个矩形path和8个矩形点
        let hiddenPathStartX = x - 5;
        let hiddenPathStartY = y - 5;
        let hiddenPathEndX = x + width + 5;
        let hiddenPathEndY = y + height + 5;

        dropNw.attr("path", "M" + (hiddenPathStartX + 5) + "," + hiddenPathStartY + "H" + hiddenPathStartX + "V" + (hiddenPathStartY + 5)).show();
        dropNe.attr("path", "M" + (hiddenPathEndX - 5) + "," + hiddenPathStartY + "H" + hiddenPathEndX + "V" + (hiddenPathStartY + 5)).show();
        dropSw.attr("path", "M" + (hiddenPathStartX + 5) + "," + hiddenPathEndY + "H" + hiddenPathStartX + "V" + (hiddenPathEndY - 5)).show();
        dropSe.attr("path", "M" + (hiddenPathEndX - 5) + "," + hiddenPathEndY + "H" + hiddenPathEndX + "V" + (hiddenPathEndY - 5)).show();
    };

    hideDropRect() {
        let {dropNw, dropNe, dropSw, dropSe} = this;
        dropNw.hide();
        dropNe.hide();
        dropSw.hide();
        dropSe.hide();
    };

    beginCreateLink(targetElement) {
        if (this.selectElement && this.selectElement != targetElement) {
            this.hideEditElements(this.selectElement);
        }
        this.showEditElements(this.selectElement = targetElement);
        // 设置激活状态
        this.activeFromElement = targetElement;
        this.showFadeOutText("点击节点完成连线,空白区域取消！");
    };

    showFadeOutText(text, color) {
        alert(text);
    };

    createLink(activeFromElement, targetElement) {

        if (activeFromElement == targetElement) {
            this.showFadeOutText("不能自连接", "red");
            return;
        }
        // 校验
        let sameContainer = activeFromElement.data("container") == targetElement.data("container");
        if (!sameContainer) {
            this.showFadeOutText("不在同一个容器不能相连", "red");
            return;
        }
        let fromDateType = activeFromElement.data("type");
        let toDateType = targetElement.data("type");
        // 开始节点只能单出
        if (toDateType == "start") {
            this.showFadeOutText("开始节点不能作为目的节点", "red");
            return;
        }
        // 判断from和to2个点之间是否已经存在了连线
        // 遍历from的out即可
        let outLines = activeFromElement.data("out");
        if (outLines) {
            for (var i in outLines) {
                let outLine = outLines[i];
                let tempToElement = outLine.data("to");
                if (tempToElement == targetElement) {
                    // 已存在
                    this.showFadeOutText("连线已存在", "red");
                    return;
                }
            }
        }
        let standardMode = this.designMode != "Simple";
        // 标准模式校验分支及单进单出
        if (standardMode) {
            // 除去分支节点外，其他节点只能单出
            if (fromDateType != "diverage") {
                let outLines = activeFromElement.data("out");
                let len = 0 || (outLines && Object.getOwnPropertyNames(outLines).length);
                if (len > 0) {
                    this.showFadeOutText("非分支节点只能单出", "red");
                    return;
                }
            }
            if (toDateType != "converge") {
                let inLines = targetElement.data("in");
                let len = 0 || (inLines && Object.getOwnPropertyNames(inLines).length);
                if (len > 0) {
                    this.showFadeOutText("非聚合节点只能单进", "red");
                    return;
                }
            }
        }
        this.createPath(activeFromElement, targetElement);
        return true;
    };

    /**
     * 通过translate平移
     *
     * @param x
     * @param y
     */
    translateTo(x, y) {
        this.translateX = x;
        this.translateY = y;

        // // svg 画板
        // Object.assign(this.paper.canvas.style, {
        //     transform: `translate(${x}px, ${y}px)`
        // });
        this.paper.canvas.childNodes.forEach(child => {
            Object.assign(child.style, {
                transform: `translate(${x}px, ${y}px)`
            });
        });

        // update HtmlNodes
        for (let elementId in this.elements) {
            let element = this.elements[elementId];
            if (element.type == "html") {
                Object.assign(element.node.style, {
                    transform: `translate(${x}px, ${y}px)`
                });
            }
        }
    };

    /**
     * 指定元素平移
     *
     * @param elements
     * @param dx
     * @param dy
     */
    elementsPanTo(elements, dx, dy) {
        for (let elementId in elements) {
            let element = elements[elementId];
            this.moveTo(element, dx, dy);
        }

        // update
        for (let elementId in elements) {
            let element = elements[elementId];
            if (element.type == "path") {
                this.updateLine(element);
            } else {
                // this.updateElements(element);
            }
        }
    };

    /***
     * 整体平移
     *
     * @param dx x方向偏移量
     * @param dy y方向偏移量
     * @param elements
     */
    panTo(dx, dy) {
        this.hideEditElements(null);
        this.translateTo(0, 0);
        this.elementsPanTo(this.elements, dx, dy);
        this.moveTo(this.groupSelection, dx, dy);
    };

    /***/
    moveTo(element, dx, dy) {
        if (!element || !element.type) return;
        let type = element.type;
        if (type == "path") {
            let startElement = element && element.data("start");
            if (startElement) {
                this.moveTo(startElement, dx, dy);
                let nextElement = startElement.data("right");
                while (nextElement) {
                    this.moveTo(nextElement, dx, dy);
                    let temp = nextElement;
                    let leftRect = temp.data("leftRect");
                    this.moveTo(leftRect, dx, dy);
                    nextElement = nextElement.data("right");
                }
            }
        } else {
            let {x, y} = element.attrs;
            element.attr({x: x + dx, y: y + dy});
        }

        // move text
        let textElement = element.data("text");
        if (textElement) {
            textElement.attr({x: textElement.attr("x") + dx, y: textElement.attr("y") + dy});
        }
    };

    getContextMenuFn(targetElement) {
        // let elementType = targetElement.type;
        // let dataType = targetElement.data("type");
        //
        // let me = this;
        // let contextMenuFn = function (id) {
        //     let contextData = [{
        //         text: "删除",
        //         iconCls: 'icon-stop',
        //         click: function () {
        //             me.removeElement(targetElement);
        //         }
        //     }];
        //
        //     if (elementType == "rect" || elementType == "image") {
        //
        //         if (dataType != "end") {
        //             contextData.push("-");
        //             contextData.push({
        //                 text: "连接到",
        //                 click: function () {
        //                     me.beginCreateLink(targetElement);
        //                 }
        //             });
        //         }
        //
        //         let inLines = targetElement.data("in");
        //         let horizontalItems = [];
        //         if (inLines != null) {
        //             let inLinkIds = Object.getOwnPropertyNames(inLines);
        //             if (inLinkIds.length > 0) {
        //                 for (let i = 0; i < inLinkIds.length; i++) {
        //                     let lineElement = inLines[inLinkIds[i]];
        //                     let fromElement = lineElement.data("from");
        //                     horizontalItems.push({
        //                         text: fromElement.data("meta").nodeName,
        //                         target: fromElement,
        //                         click: function () {
        //                             me.horizontalAlign(targetElement, this.target);
        //                         }
        //                     });
        //                 }
        //             }
        //         }
        //         let outLines = targetElement.data("out");
        //         if (outLines != null) {
        //             let outLinkIds = Object.getOwnPropertyNames(outLines);
        //             if (outLinkIds.length > 0) {
        //                 for (let i = 0; i < outLinkIds.length; i++) {
        //                     let lineElement = outLines[outLinkIds[i]];
        //                     let toElement = lineElement.data("to");
        //                     horizontalItems.push({
        //                         text: toElement.data("meta").nodeName,
        //                         target: toElement,
        //                         click: function () {
        //                             me.horizontalAlign(targetElement, this.target);
        //                         }
        //                     });
        //                 }
        //             }
        //         }
        //         if (horizontalItems.length > 0) {
        //             contextData.push("-");
        //             if (horizontalItems.length == 1) {
        //                 contextData.push({
        //                     text: "水平对齐",
        //                     target: horizontalItems[0].target,
        //                     click: function () {
        //                         me.horizontalAlign(targetElement, this.target);
        //                     }
        //                 }, {
        //                     text: "垂直对齐",
        //                     target: horizontalItems[0].target,
        //                     click: function () {
        //                         me.verticalAlign(targetElement, this.target);
        //                     }
        //                 });
        //             } else {
        //                 let verticalItems = [];
        //                 $(horizontalItems).each(function () {
        //                     let horizontalItem = this;
        //                     verticalItems.push({
        //                         text: horizontalItem.text,
        //                         target: horizontalItem.target,
        //                         click: function () {
        //                             me.verticalAlign(targetElement, this.target);
        //                         }
        //                     });
        //                 });
        //
        //
        //
        //
        //
        //
        //
        //                 contextData.push({
        //                     text: "水平对齐",
        //                     items: horizontalItems
        //                 }, {
        //                     text: "垂直对齐",
        //                     items: verticalItems
        //                 });
        //             }
        //         }
        //         return contextData;
        //     } else if (elementType == "path") {
        //         return contextData;
        //     }
        // };
        // return contextMenuFn;
    };

    /**
     * 创建开始节点
     *
     * @param x
     * @param y
     * @param r
     * @returns {*}
     */
    createStartNode(x, y) {
        // return this.createImage(imgs.start, x || 100, y || 150, 48, 48, "Start");
        return this.createHTMLNode("start", x || 100, y || 150, 48, 48, "Start").attr({
            color: this.option.settings.themeColor
        });
    };

    /**
     * 创建结束节点(使用svg)
     */
    createEndNode(x, y) {
        // return this.createImage(imgs.end, x || 850, y || 150, 48, 48, "End", true);
        return this.createHTMLNode("end", x || 100, y || 150, 48, 48, "End").attr({
            color: this.option.settings.themeColor
        });
    };

    /**
     * 创建分支节点(默认类型为xor)
     */
    createSplitNode(x, y) {
        return this.createHTMLNode("xor", x || 100, y || 150, 64, 64, "Split").attr({
            color: this.option.settings.themeColor
        });
    };

    /**
     * 创建分支节点
     */
    createJoinNode(x, y) {
        return this.createHTMLNode("join", x || 100, y || 150, 64, 64, "Join").attr({
            color: this.option.settings.themeColor
        });
    };

    /**
     * 创建图片节点
     *
     * @param src
     * @param x
     * @param y
     * @param w
     * @param h
     * @param nodeType
     * @returns {*}
     */
    createHTMLNode(type, x, y, w, h, nodeType) {
        let htmlElement = this.renderHTML(type, x, y, w, h);
        if (!htmlElement) return null;
        this.setElementUUID(htmlElement);
        onNodeCreated(htmlElement, this);
        htmlElement.data("handler", {});
        htmlElement.data("nodeType", nodeType);
        htmlElement.attr("title", nodeType + ":" + htmlElement.id);
        this.autoContainerSelect(htmlElement);
        this.initElement(htmlElement);
        return htmlElement;
    };

    /**
     * 创建节点
     *
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {*}
     */
    createNode(x, y, width, height) {
        // let rect = this.renderRect(x, y, width, height, 4);
        let rect = this.renderRect(x, y, width || 100, height || 80, 4);
        this.setElementUUID(rect);
        // rect.id = this.createElementId();
        rect.attr({
            stroke: this.option.settings.themeColor,
            "stroke-width": this.option.settings.nodeStrokeWith,
            title: "id:" + rect.id,
            fill: this.option.settings.nodeBackgroundColor
        });
        rect.data("handler", {});

        // create text
        let text = this.paper.text(0, 0).attr({
            "font-size": 13,
            "text-anchor": "middle",
            "font-style": "normal",
            "width": 3,
            text: this.option.settings.nodeName + " " + this.nextId()
        });
        // text.id = me.getUUID();
        rect.data("text", text);
        onNodeCreated(rect, this);

        this.autoContainerSelect(rect);
        this.initElement(rect);
        return rect;
    };

    /**
     * 创建图片节点
     *
     * @param src
     * @param x
     * @param y
     * @param w
     * @param h
     * @param nodeType
     * @returns {*}
     */
    createImage(src, x, y, w, h, nodeType) {
        let image = this.renderImage(src, x, y, w, h);
        // id需要第一时间修改
        // image.id = this.createElementId();
        // image.data("type", "node");
        image.data("nodeType", nodeType);
        image.attr("title", nodeType + ":" + image.id);
        this.autoContainerSelect(image);
        this.initElement(image);
        return image;
    };

    /**
     * 创建业务节点
     *
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {*}
     */
    createBusinessNode(x, y) {
        let rect = this.createNode(x, y);
        rect.data("nodeType", NodeTypes.Business);
        return rect;
    };

    // createMutiSubProcess(x, y, width, height, editable) {
    //     let rect = this.renderRect(x, y, width, height);
    //     rect.attr({
    //         "stroke": "black",
    //         fill: "white"
    //     });
    //     rect.id = this.createElementId();
    //     rect.data("type", "mutiSubProcess");
    //     if (!editable) {
    //         return rect;
    //     }
    //     this.initElement(rect);
    //     return rect;
    // };


    /**
     * 根据数据构建节点
     *
     * @param node
     * @returns {null}
     */
    createNodeElement(node) {
        let {id, type, component} = node;
        let {type: componentType, attrs, textAttrs} = component;
        let nodeElement = null;
        if (componentType == "rect") {
            nodeElement = this.renderRect(0, 0, 0, 0, 0);
        } else if (componentType == "image") {
            //
            // element = this.loadImageElement(node, editable);
            // element.data("meta", Object.assign(node.meta, element.data("meta") || {}));
        }
        nodeElement.id = id;
        if (attrs.rx) {
            // 圆角处理
            nodeElement.attrs.r = attrs.rx;
        }
        nodeElement.data("nodeType", type);
        nodeElement.attr(attrs);
        let nodeText = this.paper.text("").attr(textAttrs);
        // nodeText.id = this.getUUID();
        nodeElement.data("text", nodeText);
        nodeElement.attr("title", "id:" + id);
        this.textEditing(nodeText);
        this.initElement(nodeElement);
        return nodeElement;
    };

    /**
     * 根据数据生成元素（html）
     *
     * @param id
     * @param type
     * @param component
     * @param nodeType
     * @returns {*}
     */
    loadHTMLElement(id, type, component, nodeType) {
        let {attrs} = component;
        let htmlElement = this.renderHTML(type, 0, 0, 0, 0);
        htmlElement.id = id;
        // htmlElement.data("type", "node");
        htmlElement.data("nodeType", nodeType);
        htmlElement.attr(attrs);
        htmlElement.attr("title", "id:" + htmlElement.id);
        this.initElement(htmlElement);
        return htmlElement;
    };

    /**
     * 根据数据生成元素（image）
     *
     * @param id
     * @param src
     * @param component
     * @param nodeType
     * @returns {*}
     */
    loadImageElement(id, src, component, nodeType) {
        let {attrs} = component;
        attrs.src = src;
        let image = this.renderImage("", 0, 0, 0, 0);
        image.id = id;
        // image.data("type", "node");
        image.data("nodeType", nodeType);
        image.attr(attrs);
        image.attr("title", "id:" + image.id);
        this.initElement(image);
        return image;
    };

    /**
     * 根据数据回显渲染连线（path）
     *
     * @param connectData
     * @param fromElement
     * @param toElement
     * @returns {*}
     */
    createConnectElement(connectData, fromElement, toElement) {
        let {id, component} = connectData;
        // let {attrs, arrowAttrs, textAttrs} = component;
        let {attrs, textAttrs} = component;

        let connect = this.paper.path("").attr(attrs);
        connect.id = id;
        this.setConnectArrow(connect);

        // // 箭头
        // let arrow = this.paper.path("").attr(arrowAttrs);
        // connect.data("arrow", arrow);

        // 文本 
        let pathText = this.paper.text("").attr(textAttrs);
        connect.data("text", pathText);

        // 绑定数据关系
        connect.data("from", fromElement);
        connect.data("to", toElement);

        let outLines = fromElement.data("out") || {};
        outLines[id] = connect;
        fromElement.data("out", outLines);

        let inLines = toElement.data("in") || {};
        inLines[id] = connect;
        toElement.data("in", inLines);

        // // link 设置容器
        // if (fromElement.data("container")) {
        //     link.data("container", fromElement.data("container"));
        // }

        // 创建控制点并绑定关系
        let points = attrs.path;
        let len = points.length;
        let startElement, endElement;

        let controlElements = [];
        for (let i = 0; i < len; i++) {
            let point = points[i];
            let controlElement = this.createControlDragRect(point[1], point[2], connect);
            controlElement.data("controlPointIndex", -1);
            // if (connect.data("container")) {
            //     this.relativePosition(controlElement, connect.data("container"));
            // }
            controlElements.push(controlElement);
            if (i == 0) {
                startElement = controlElement;
                startElement.data("fromNode", fromElement);
                startElement.data("type", "start");
                connect.data("start", startElement);
            } else {
                let prevControlElement = controlElements[i - 1];
                prevControlElement.data("right", controlElement);
                controlElement.data("left", prevControlElement);

                let centerDragRect = this.createControlDragRect((prevControlElement.attr("x") + controlElement.attr("x") + 5) / 2, (prevControlElement.attr("y") + controlElement.attr("y") + 5) / 2, connect);
                centerDragRect.data("controlPointIndex", 0);
                centerDragRect.data("left", prevControlElement);
                centerDragRect.data("right", controlElement);

                prevControlElement.data("rightRect", centerDragRect);
                controlElement.data("leftRect", centerDragRect);
            }
            if (i == len - 1) {
                endElement = controlElement;
                endElement.data("toNode", toElement);
                endElement.data("type", "end");
                connect.data("end", endElement);
            }
        }
        // 隐藏编辑
        this.hideEditElements(connect);
        // 绑定事件
        this.bindSelectEvent(connect);
        this.registerElement(connect);
        return connect;
    };

    // 创建连线路径
    createPath(fromNode, toNode) {
        let stroke = this.option.settings.themeColor;
        let linkPath = this.paper.path("").attr({
            "stroke": stroke,
            "stroke-width": 2
        });
        this.setConnectArrow(linkPath, stroke);
        this.setElementUUID(linkPath);
        let pathStyle = this.option.pathStyle || "broken";
        linkPath.data("pathStyle", pathStyle);
        // 同步容器
        // if (fromNode.data("container")) {
        //     linkPath.data("container", fromNode.data("container"));
        // }
        linkPath.data("from", fromNode);
        linkPath.data("to", toNode);

        let outLines = fromNode.data("out") || {};
        outLines[linkPath.id] = linkPath;
        fromNode.data("out", outLines);

        if (Object.keys(outLines).length == 1) {
            this.setConnectType(linkPath, "Always");
        } else {
            this.setConnectType(linkPath, this.option.defaultConditionType || "Script");
        }
        onConnectCreated(linkPath, this);

        let inLines = toNode.data("in") || {};
        inLines[linkPath.id] = linkPath;
        toNode.data("in", inLines);

        // 初始化连线
        this.resetPathData(linkPath, fromNode, toNode, pathStyle);
        // 绑定事件
        this.bindSelectEvent(linkPath);
        // 隐藏编辑状态
        this.hideEditElements(null);
        // 选中
        this.selectElement = linkPath;
        // 注册连线
        this.registerElement(linkPath);
        // return
        return linkPath;
    };

    /**
     * 重置路径连线数据
     *
     * @param pathElement
     * @param fromElement
     * @param toElement
     * @param pathStyle  连线风格
     */
    resetPathData(pathElement, fromElement, toElement, pathStyle) {
        // reset pathElement
        this.removePathRelationRects(pathElement);
        // 直线数据
        let linePathData = this.getLinePathData(fromElement, toElement, false);
        let pathStartPoint = linePathData.start;
        let pathEndPoint = linePathData.end;

        // 暂时设置至直线数据
        pathElement.attr("path", linePathData.data);
        pathElement.data("pathStyle", pathStyle);

        // centerDragRect.attr("x") - 10, centerDragRect.attr("y") - 10
        let startX = pathStartPoint.x, startY = pathStartPoint.y;
        let endX = pathEndPoint.x, endY = pathEndPoint.y;
        let centerX = (startX + endX) / 2, centerY = (startY + endY) / 2;

        switch (pathStyle) {
            case "broken": {
                // 创建3个控制点
                let startElement = this.createControlDragRect(startX, startY, pathElement);
                let endElement = this.createControlDragRect(endX, endY, pathElement);
                startElement.data("fromNode", fromElement);
                endElement.data("toNode", toElement);
                pathElement.data("start", startElement);
                pathElement.data("end", endElement);

                startElement.data("right", endElement);
                endElement.data("left", startElement);

                startElement.data("type", "start");
                endElement.data("type", "end");

                // 创建中间拖动的矩形
                let centerDragRect = this.createControlDragRect(centerX, centerY, pathElement);
                centerDragRect.data("controlPointIndex", 0);
                centerDragRect.data("left", startElement);
                centerDragRect.data("right", endElement);

                startElement.data("rightRect", centerDragRect);
                endElement.data("leftRect", centerDragRect);
                // 线段
                break;
            }
            case "straight": {
                // 直线 donothing
                break;
            }
            case "h2v": {
                break;
            }
            case "v2h": {
                break;
            }
            case "curve": {
                break;
            }
            default: {
                break;
            }
        }

        // 文本
        let pathText = pathElement.data("text");
        if (!pathText) {
            pathText = this.paper.text(centerX - 2.5 - 10, centerY - 2.5 - 10).attr({
                "font-size": 13,
                "text-anchor": "middle",
                "font-style": "normal",
                text: this.option.settings.linkName || " "
            });
            pathElement.data("text", pathText);
        } else {
            pathText.attr({x: centerX - 2.5 - 10, y: centerY - 2.5 - 10});
        }

        // 创建箭头
        // let arrowPathData = this.getArrowPathData(startX, startY, endX, endY);
        // let arrowPath = pathElement.data("arrow");
        // if (!arrowPath) {
        //     arrowPath = this.paper.path(arrowPathData).attr({
        //         "stroke": this.option.settings.themeColor,
        //         "stroke-width": 2,
        //         "fill": this.option.settings.themeColor
        //     });
        //     pathElement.data("arrow", arrowPath);
        // } else {
        //     arrowPath.attr("path", arrowPathData);
        // }
    };

    createControlDragRect(x, y, pathElement) {
        let controlDragRect = this.renderRect(x - 2.5, y - 2.5, 5,
            5, 2.5, 2.5).attr({
            fill: "#ffffff",
            stroke: this.option.settings.themeColor,
            cursor: 'move'
        });
        // controlDragRect.id = this.getUUID();
        controlDragRect.data("type", "center");
        if (pathElement) {
            controlDragRect.data("host", pathElement);
        }
        let me = this;
        // 绑定事件
        controlDragRect.drag(function (dx, dy, x, y) {
            me.controlOnMove(this, dx, dy, x, y);
        }, function () {
            me.controlOnStart(this);
            me.dragingElement = this;
        }, function () {
            me.controlOnUp(this);
            me.dragingElement = null;
        });
        return controlDragRect;
    };

    controlOnMove(controlRect, dx, dy, x, y) {
        controlRect.attr({
            x: controlRect.ox + dx,
            y: controlRect.oy + dy
        });
        let type = controlRect.data("type");
        let host = controlRect.data("host");

        if (host.data("container")) {
            // 更新相对位置
            this.relativePosition(controlRect, host.data("container"));
        }

        if (type == "start") {
            // 解决zindex导致move事件不响应问题
            controlRect.hide();
            let rightElement = controlRect.data("right");
            let rightDropRect = controlRect.data("rightRect");
            rightDropRect.attr({
                x: (controlRect.attr("x") + rightElement.attr("x")) / 2,
                y: (controlRect.attr("y") + rightElement.attr("y")) / 2
            });
            // update path
            this.updatePath(host);
        } else if (type == "end") {
            controlRect.hide();
            let leftElement = controlRect.data("left");
            let leftDropRect = controlRect.data("leftRect");
            leftDropRect.attr({
                x: (controlRect.attr("x") + leftElement.attr("x")) / 2,
                y: (controlRect.attr("y") + leftElement.attr("y")) / 2
            });
            // update path
            this.updatePath(host);
        } else {
            this.updatePathByControlRect(controlRect);
        }
        this.validateDropLink(host, type == "start");
    };

    controlOnStart(controlRect) {
        controlRect.ox = controlRect.attr("x");
        controlRect.oy = controlRect.attr("y");
        controlRect.data("dragging", true);

        let hostElement = controlRect.data("host");
        hostElement.data("editing", true);

        let type = controlRect.data("type");
        if (type == "start" || type == "end") {
            this.dragingLine = hostElement;
        }
    };

    controlOnUp(controlRect) {
        // 当鼠标落地后还原设置的相关控制属性
        controlRect.data("disableRestore", null);
        if (controlRect.data("restore")) {
            controlRect.data("restore", null);
            controlRect.data("controlPointIndex", 0);
        }

        let type = controlRect.data("type");
        let hostElement = controlRect.data("host");
        // 判断是否含可接收的节点
        let dropNode = this.dropNode;
        if (dropNode) {

            if (!this.validateDropLink(hostElement, type == "start")) {
                // 还原
                this.updatePathBound(hostElement);
                this.updatePath(hostElement);
                this.dragingLine = null;
                return;
            }

            let selectPath = hostElement;
            if (type == "start") {
                controlRect.show();
                /* 清除当前连线原from节点的内存关系*/
                let oldFromNode = controlRect.data("fromNode");
                if (oldFromNode.data("out")) {
                    delete oldFromNode.data("out")[selectPath.id];
                }
                /* 设置当前拖动连线新from节点并建立关系*/
                let newFromNode = dropNode;
                selectPath.data("from", newFromNode);
                controlRect.data("fromNode", newFromNode);

                let outLines = newFromNode.data("out") || {};
                outLines[selectPath.id] = selectPath;
                newFromNode.data("out", outLines);

                this.updatePathBound(selectPath);
                this.updatePath(selectPath);

            } else if (type == "end") {
                controlRect.show();
                /* 清除当前连线原目的节点的内存关系*/
                let oldToNode = selectPath.data("to");
                if (oldToNode.data("in")) {
                    delete oldToNode.data("in")[selectPath.id];
                }
                let newToNode = dropNode;
                /* 设置当前拖动连线新的目的节点并建立关系*/
                selectPath.data("to", newToNode);
                controlRect.data("toNode", newToNode);

                let inLines = newToNode.data("in") || {};
                inLines[selectPath.id] = selectPath;
                newToNode.data("in", inLines);

                this.updatePathBound(selectPath);
                this.updatePath(selectPath);
            }
        } else {
            // 还原
            this.updatePathBound(hostElement);
            this.updatePath(hostElement);
        }

        this.dragingLine = null;
    };

    getArrowPathData(x1, y1, x3, y3) {

        let Par = 10.0;
        let slopy = Math.atan2((y1 - y3),
            (x1 - x3));
        let cosy = Math.cos(slopy);
        let siny = Math.sin(slopy);
        let pathD = "M" + (Number(x3) + Number(Par * cosy - (Par / 2.0 * siny)))
            + "," + (Number(y3) + Number(Par * siny + (Par / 2.0 * cosy)));
        pathD += " L"
            + (Number(x3) + Number(Par * cosy + Par / 2.0 * siny) + "," + (Number(y3) - Number(Par
                / 2.0 * cosy - Par * siny)));
        pathD += " L" + x3 + "," + y3;
        return pathD;
    };

    textEditing(text) {
    };

    blurTextEditing() {
    };

    /**
     * 设置元素可以拖动
     *
     * @param target
     */
    dragableElement(target) {
        let me = this;
        // 支持拖拽
        target.drag((dx, dy) => {
            if (!me.option.editable) return;
            me.elementDragMove(target, dx, dy);
        }, (event) => {
            if (!me.option.editable) return;
            me.elementDragStart(target);
            me.dragingElement = target;
            return false;
        }, () => {
            if (!me.option.editable) return;
            me.dragingElement = null;
            target.attr({opacity: 1});
        });
    };

    initElement(target) {
        this.dragableElement(target);
        this.updateElements(target, true);
        this.hideEditElements(target);
        // 绑定事件
        this.bindSelectEvent(target);
        // 绑定鼠标over和out事件
        this.bindMouseOverOutEvent(target);
        // 注册
        this.registerElement(target);
    };

    elementDragMove(element, dx, dy) {
        let location = {
            x: element.ox + dx,
            y: element.oy + dy
        };
        // if (location.x < 0 || location.y < 0) {
        //     return;
        // }

        // // 判断元素是否在容器内，如果在容器内的元素禁止拖到容器外
        // let container = element.data("container");
        // if (container) {
        //     let outContainerBoundary = this.isOutContainerBoundary(element.ox + dx, element.oy + dy, element.attr("width"), element.attr("height"), container);
        //     if (!outContainerBoundary) {
        //         element.attr(location);
        //         // 如果么有越过边界，记录位置
        //         element.data("location", location);
        //     } else {
        //         return;
        //         // 越过边界后还原location
        //         // location = element.data("location");
        //         // element.attr(location);
        //     }
        // } else {
        //     // 非容器里面的节点暂时不进行碰撞校验
        // }
        element.attr(location);
        this.updateElements(element);
        this.showEditElements(element);
    };

    elementDragStart(element) {
        // storing original coordinates
        element.ox = element.attr("x");
        element.oy = element.attr("y");
        element.attr({
            opacity: .8
        });
        this.endInputEdit();
        element.attr("cursor", "move");
    };

    resizeOnStart(rect) {
        // storing original coordinates
        rect.ox = rect.attr("x");
        rect.oy = rect.attr("y");
        rect.data("host").data("editing", true);
    };

    resizeOnMove(rect, dx, dy, x, y) {
        rect.attr({
            x: rect.ox + dx,
            y: rect.oy + dy
        });
        let newx, newy, width, height;
        let diagonal = rect.data("diagonal");
        let selectRect = rect.data("host");
        if (diagonal) {

            newx = Math.min(rect.attr("x"), diagonal.attr("x")) + 7.5;
            newy = Math.min(rect.attr("y"), diagonal.attr("y")) + 7.5;
            width = Math.abs(rect.attr("x") - diagonal.attr("x")) - 10;
            height = Math.abs(rect.attr("y") - diagonal.attr("y")) - 10;

            // 子流程设置最小宽高 300 150
            if (selectRect.data("type") == "mutiSubProcess") {
                // 获取容器边界信息
                let boundary = this.getContainerBoundary(selectRect.id);
                if (boundary) {
                    width = Math.max(width, (boundary.boundaryX - newx));
                    height = Math.max(height, (boundary.boundaryY - newy));
                }
            } else {
                // 其他默认最小 80 30
                width = Math.max(width, 80);
                height = Math.max(height, 30);
            }

            var direction = rect.data("direction");
            if (direction == "w" || direction == "e") {
                // 水平移动
                selectRect.attr({
                    "x": newx,
                    "width": width
                });
            } else if (direction == "n" || direction == "s") {
                // 垂 直移动
                selectRect.attr({
                    "y": newy,
                    "height": height
                });
            } else {
                // 对角移动
                selectRect.attr({
                    "x": newx,
                    "y": newy,
                    "width": width,
                    "height": height
                });
            }
        }
        this.updateElements(selectRect);
        this.showEditElements(selectRect);
    };

    linkToolOnDragMove(linkTool, dx, dy) {
        // 初始化位置
        let {x, y} = linkTool.attrs;
        // move 修改鼠标
        let mx = x + dx;
        let my = y + dy;
        // 创建一个透明的点
        let dropEndRect = linkTool.data("dropEndRect");
        let element = linkTool.data("from");
        if (dropEndRect == null) {
            dropEndRect = this.renderRect(mx, my, 20, 5)
                .attr({
                    fill: "#000000",
                    cursor: 'move',
                    opacity: 0
                }).hide();
            linkTool.data("dropEndRect", dropEndRect);
        } else {
            dropEndRect.attr({
                x: mx,
                y: my
            });
        }
        let virtualData = this.getLinePathData(element, dropEndRect, true);
        let virtualPath = linkTool.data("virtualPath");
        if (virtualPath == null) {
            virtualPath = this.paper.path(virtualData.data).attr({
                "stroke": this.option.settings.themeColor,
                "stroke-width": 2,
                "fill": this.option.settings.themeColor
            });
            if (virtualPath.node) {
                virtualPath.node.setAttribute("stroke-dasharray", "2 2");
            }
            // virtualPath.id = this.getUUID();
            linkTool.data("virtualPath", virtualPath);
        } else {
            virtualPath.attr("path", virtualData.data);
        }
        virtualPath.show();

        virtualPath.data("from", element);
        this.dragingLine = virtualPath;

        // 设置禁用样式
        this.validateDropLink(virtualPath);
    };

    linkToolOnDragUp(linkTool) {
        this.hideDropRect();
        let virtualPath = linkTool.data("virtualPath");
        if (virtualPath) {
            virtualPath.hide();
        } else {
            // alert(" error catch !");
        }
        // debug("drop / " + this.dropNode);
        let dropNode = this.dropNode;
        if (dropNode) {

            if (!this.validateDropLink(virtualPath)) {
                console.log(" ----------------- validateDropLink false ");
                this.dragingLine = null;
                return;
            }
            let fromNode = virtualPath.data("from");
            if (fromNode == dropNode) {
                // 如果to环节和当前from环节相同直接返回
                this.dragingLine = null;
                return;
            }
            // 创建link之前判断是否from和to是否连通（不一定是直接相连）
            let isConnect = this.isConnect(fromNode, dropNode, true);
            let outPath = this.createPath(fromNode, dropNode);
            this.dropNode = null;
            this.dragingLine = null;

            // 如果from和to已经连通，有可能是回退或新增的分支连线，处理用户体验方面的问题（连线被遮住）
            if (isConnect) {
                // 移动中央控制点，终点位置取fromNode和dropNode连线线段的2点做中垂线，偏离2点的15度角度
                let x1 = outPath.data("start").attr("x");
                let y1 = outPath.data("start").attr("y");

                let x2 = outPath.data("end").attr("x");
                let y2 = outPath.data("end").attr("y");

                let x0 = 0, y0 = 0, len, PI = 3.141592653;
                if (y1 == y2) {
                    // 同一水平线上
                    x0 = (x1 + x2) / 2;
                    len = Math.abs(x2 - x1);
                    y0 = y1 - len / 2 * Math.tan(15 / 180 * PI);
                    y0 = Math.max(y0, 1);
                } else if (x1 == x2) {
                    // 暂时不处理
                } else {
                    len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                    let h = len / 2 * Math.tan(15 / 180 * PI);

                    let centerX = (x1 + x2) / 2;
                    let centerY = (y1 + y2) / 2;

                    // 中垂线斜率 = -1/k',k' = (y2 - y1 / x2 - x1)
                    let k = -(x2 - x1) / (y2 - y1);
                    let angle = Math.atan(k);
                    let sinValue = Math.sin(angle);
                    let cosValue = Math.cos(angle);

                    let dy = h * sinValue;
                    let dx = h * cosValue;

                    x0 = dx + centerX;
                    y0 = dy + centerY;
                }

                if (x0 || y0) {
                    let controlElement = outPath.data("start").data("rightRect");
                    controlElement.attr({
                        x: x0,
                        y: y0
                    });
                    // if (outPath.data("container")) {
                    //     this.relativePosition(controlElement, outPath.data("container"));
                    // }
                    this.updatePathByControlRect(controlElement);
                }
            }
        } else {
            this.dragingLine = null;
        }
    };

    validateDropLink(pathElement, reverse) {

        let standardMode = this.designMode != "Simple";
        let me = this, dropNode = me.dropNode;
        if (dropNode) {

            let isSameContainer = function (fromElement, toElement) {
                let sameContainer = fromElement.data("container") == toElement.data("container");
                if (!sameContainer) {
                    dropNode.attr("cursor", "not-allowed");
                }
                return sameContainer;
            };

            // 除去分支节点外，其他节点只能单出
            let from = pathElement.data("from");
            let to = pathElement.data("to");

            let fromDataType = from.data("type");
            let dateType = dropNode.data("type");
            // 开始节点只能单出
            if (dateType == "start" && !reverse) {
                dropNode.attr("cursor", "not-allowed");
                return false;
            }

            // 如果2个容器不一致，直接禁用
            let sameContainer = reverse ? isSameContainer(dropNode, to) : isSameContainer(from, dropNode);
            if (!sameContainer) {
                return false;
            }

            // 判断from和to2个点之间是否已经存在了连线
            // 遍历from的out即可
            let outLines = reverse ? dropNode.data("out") : from.data("out");
            if (outLines) {
                for (let i in outLines) {
                    let outLine = outLines[i];
                    let tempToElement = outLine.data("to");
                    if (tempToElement == (reverse ? to : dropNode)) {
                        // 已存在
                        dropNode.attr("cursor", "not-allowed");
                        return false;
                    }
                }
            }

            // 如果使用的open模式不进行后续的校验，直接通过
            if (!standardMode) {
                return true;
            }

            // 如果reverse为true说明是反向连接，dropNode即将是pathElement的from端
            if (reverse) {
                // 判断pathElement是否本来就是dropNode的from（连线的开始点拉出来后又还原回去），如果是返回true
                if (from == dropNode) {
                    // 还原
                    return true;
                }
                // 除去分支节点外，其他节点只能单出
                if (dateType != "diverage") {
                    let outLines = dropNode.data("out");
                    let len = 0 || (outLines && Object.getOwnPropertyNames(outLines).length);
                    if (len > 0) {
                        dropNode.attr("cursor", "not-allowed");
                        return false;
                    }
                }
                // end节点不能作为from端
                if (dateType == "end") {
                    dropNode.attr("cursor", "not-allowed");
                    return false;
                }
                from = dropNode;
            } else {
                // 除去聚合节点外，其他节点只能单进
                if (dateType != "converge") {
                    if (to == dropNode) {
                        // 还原
                        return true;
                    }
                    let inLines = dropNode.data("in");
                    let len = 0 || (inLines && Object.getOwnPropertyNames(inLines).length);
                    if (len > 0) {
                        dropNode.attr("cursor", "not-allowed");
                        return false;
                    }
                }

                if (fromDataType != "diverage") {
                    if (to) {
                        // 如果to存在说明是已经存在的link,当前操作可能是变更连接to端，而非virthPath
                        return isSameContainer(from, dropNode);
                    }
                    let outLines = from.data("out");
                    let len = 0 || (outLines && Object.getOwnPropertyNames(outLines).length);
                    if (len > 0) {
                        dropNode.attr("cursor", "not-allowed");
                        return false;
                    }
                }

            }
        }
        return true;
    };

    hideEditElements(targetElement) {
        let type = null;
        if (!targetElement || (type = targetElement.type) == "rect" || type == "image" || type == "html") {
            let {nw, w, sw, n, s, ne, e, se, dashOuterPath, linkTool, nextTaskTool, nextSplitTool, nextEndTool} = this;
            nw.hide();
            w.hide();
            sw.hide();
            n.hide();
            s.hide();
            ne.hide();
            e.hide();
            se.hide();
            dashOuterPath.hide();
            linkTool.hide();
            nextTaskTool.hide();
            nextSplitTool.hide();
            nextEndTool.hide();
        } else if (type == "path") {
            // 连线
            let startElement = targetElement.data("start");
            startElement.hide();
            let nextElement = startElement.data("right");
            while (nextElement) {
                nextElement.hide();
                let leftRect = nextElement.data("leftRect");
                leftRect.hide();
                nextElement = nextElement.data("right");
            }
        }

        if (targetElement) {
            targetElement.attr("cursor", "auto");
        }
    };


    setSelectElement(element) {
        this.selectElement = element;
        this.showEditElements(element);
    };

    showEditElements(targetElement) {
        if (!this.option.editable) {
            return;
        }
        let type = targetElement.type;
        let isImage = type == "image";
        if (type == "rect" || isImage || type == "html") {
            let {x, y, width, height} = targetElement.attrs;
            let nodeType = targetElement.data("nodeType");
            let {nw, w, sw, n, s, ne, e, se, dashOuterPath, linkTool, nextTaskTool, nextSplitTool, nextEndTool} = this;
            // 更新位置，并显示
            let hiddenPathStartX = x - 5;
            let hiddenPathStartY = y - 5;
            let hiddenPathEndX = x + width + 5;
            let hiddenPathEndY = y + height + 5;
            let hiddenPathWidth = hiddenPathEndX - hiddenPathStartX;
            let hiddenPathHeight = hiddenPathEndY - hiddenPathStartY;

            let outerPathD = "M" + hiddenPathStartX + "," + hiddenPathStartY + "L"
                + hiddenPathStartX + "," + hiddenPathEndY + "L"
                + hiddenPathEndX + "," + hiddenPathEndY + "L"
                + hiddenPathEndX + "," + hiddenPathStartY + "L"
                + hiddenPathStartX + "," + hiddenPathStartY;

            dashOuterPath.attr({
                path: outerPathD,
                fill: "none",
                stroke: "#909399"
            }).show();

            if (!isImage) {
                // 8个矩形点
                nw.data("host", targetElement).attr({x: hiddenPathStartX - 2.5, y: hiddenPathStartY - 2.5}).show();
                w.data("host", targetElement).attr({
                    x: hiddenPathStartX - 2.5,
                    y: hiddenPathStartY + hiddenPathHeight / 2 - 2.5
                }).show();
                sw.data("host", targetElement).attr({x: hiddenPathStartX - 2.5, y: hiddenPathEndY - 2.5}).show();
                n.data("host", targetElement).attr({
                    x: hiddenPathStartX + hiddenPathWidth / 2 - 2.5,
                    y: hiddenPathStartY - 2.5
                }).show();
                s.data("host", targetElement).attr({
                    x: hiddenPathStartX + hiddenPathWidth / 2 - 2.5,
                    y: hiddenPathEndY - 2.5
                }).show();
                ne.data("host", targetElement).attr({x: hiddenPathEndX - 2.5, y: hiddenPathStartY - 2.5}).show();
                e.data("host", targetElement).attr({
                    x: hiddenPathEndX - 2.5,
                    y: hiddenPathStartY + hiddenPathHeight / 2 - 2.5
                }).show();
                se.data("host", targetElement).attr({x: hiddenPathEndX - 2.5, y: hiddenPathEndY - 2.5}).show();
            }
            if (nodeType != "End") {
                linkTool.data("from", targetElement).attr({x: hiddenPathEndX + 10, y: hiddenPathStartY}).show();
                nextTaskTool.data("from", targetElement).attr({
                    x: hiddenPathEndX + 10,
                    y: hiddenPathStartY + 16
                }).show();
                nextSplitTool.data("from", targetElement).attr({
                    x: hiddenPathEndX + 10,
                    y: hiddenPathStartY + 32
                }).show();
                nextEndTool.data("from", targetElement).attr({
                    x: hiddenPathEndX + 10,
                    y: hiddenPathStartY + 48
                }).show();
            }
            // dropNw.attr("path", "M" + (hiddenPathStartX + 5) + "," + hiddenPathStartY + "H" + hiddenPathStartX + "V" + (hiddenPathStartY + 5));
            // dropNe.attr("path","M" + (hiddenPathEndX - 5) + "," + hiddenPathStartY + "H" + hiddenPathEndX + "V" + (hiddenPathStartY + 5));
            // dropSw.attr("path","M" + (hiddenPathStartX + 5) + "," + hiddenPathEndY + "H" + hiddenPathStartX + "V" + (hiddenPathEndY - 5));
            // dropSe.attr("path","M" + (hiddenPathEndX - 5) + "," + hiddenPathEndY + "H" + hiddenPathEndX + "V" + (hiddenPathEndY - 5));
        } else if (type == "path") {
            // 连线
            let startElement = targetElement.data("start");
            startElement.show();
            let nextElement = startElement.data("right");
            while (nextElement) {
                nextElement.show();
                let leftRect = nextElement.data("leftRect");
                leftRect.show();
                nextElement = nextElement.data("right");
            }
        }
        targetElement.attr("cursor", "move");
    };

    /**
     * 更新当前激活编辑的文本
     * @param textValue
     */
    updateActiveText(textValue, visible) {
        if (this.textElement) {
            this.textElement.attr("text", textValue);
            if (visible) {
                this.textElement.show();
            }
        }
    };

    updateElements(targetElement) {
        let me = this;
        let text = targetElement.data("text");
        if (text) {
            let {x, y, width, height} = targetElement.attrs;
            let textX = x + width / 2;
            let textY = y + height / 2;
            // 更新text位置
            text.attr("x", textX).attr("y", textY);
        }
        if (targetElement.data("in")) {
            let inLines = targetElement.data("in");
            for (let i in inLines) {
                me.updateLine(inLines[i]);
            }
        }
        if (targetElement.data("out")) {
            let outLines = targetElement.data("out");
            for (let j in outLines) {
                me.updateLine(outLines[j]);
            }
        }
    };

    updateLine(hostElement) {

        let startElement = hostElement.data("start");
        let endElement = hostElement.data("end");

        if (startElement.data("fromNode")) {
            let fromElement = startElement.data("fromNode");
            let fromElementRight = startElement.data("right");

            let isToNode = endElement == fromElementRight && endElement.data("toNode") != null;
            let linePathData = this.getLinePathData(fromElement, isToNode ? endElement.data("toNode") : fromElementRight, false);
            let pathStartPoint = linePathData.start;
            startElement.attr({
                x: pathStartPoint.x - 2.5,
                y: pathStartPoint.y - 2.5
            });

            // if (hostElement.data("container")) {
            //     this.relativePosition(startElement, hostElement.data("container"));
            // }

            // 更新rightrect的位置
            let rightControlRect = startElement.data("rightRect");
            rightControlRect.attr({
                x: (startElement.attr("x") + fromElementRight.attr("x")) / 2,
                y: (startElement.attr("y") + fromElementRight.attr("y")) / 2
            });
        }

        if (endElement.data("toNode")) {
            let toElement = endElement.data("toNode");
            let toElementLeft = endElement.data("left");

            let isFromNode = startElement == toElementLeft && startElement.data("fromNode") != null;
            let linePathData = this.getLinePathData(isFromNode ? startElement.data("fromNode") : toElementLeft, toElement, false);
            let pathEndPoint = linePathData.end;
            endElement.attr({
                x: pathEndPoint.x - 2.5,
                y: pathEndPoint.y - 2.5
            });

            if (hostElement.data("container")) {
                this.relativePosition(endElement, hostElement.data("container"));
            }

            // 更新rightrect的位置
            let leftControlRect = endElement.data("leftRect");
            leftControlRect.attr({
                x: (toElementLeft.attr("x") + endElement.attr("x")) / 2,
                y: (toElementLeft.attr("y") + endElement.attr("y")) / 2
            });
        }

        this.updatePath(hostElement);
    };

    /** 拖拽过程中实时更新path */
    updatePath(pathElement) {
        let pathStyle = pathElement.data("pathStyle");
        switch (pathStyle) {
            case "broken": {
                // 连线的开始元素
                let startElement = pathElement.data("start");
                let startRightRect = startElement.data("rightRect");
                // path文本位置更新
                pathElement.data("text").attr({
                    x: startRightRect.attr("x") - 10,
                    y: startRightRect.attr("y") - 10
                });
                let pathData = "M" + (startElement.attr("x") + 2.5) + "," + (startElement.attr("y") + 2.5);
                // let arrowPathEnd = pathElement.data("end");
                // let arrowPathStart = startElement;
                let nextElement = startElement.data("right");
                while (nextElement) {
                    let temp = nextElement;
                    // if (hostElement.data("container")) {
                    //     let containerElement = hostElement.data("container");
                    //     let relativePosition = nextElement.data("relativePosition");
                    //     // 更新坐标
                    //     nextElement.attr({
                    //         x: containerElement.attr("x") + relativePosition.x,
                    //         y: containerElement.attr("y") + relativePosition.y
                    //     });
                    //     // 更新中点的坐标
                    //     let leftElement = nextElement.data("left");
                    //     let centerRect = nextElement.data("leftRect");
                    //     if (centerRect) {
                    //         centerRect.attr({
                    //             x: leftElement.attr("x") / 2 + nextElement.attr("x") / 2,
                    //             y: leftElement.attr("y") / 2 + nextElement.attr("y") / 2
                    //         });
                    //     }
                    // }
                    pathData += " L" + (nextElement.attr("x") + 2.5) + "," + (nextElement.attr("y") + 2.5) + " ";
                    nextElement = nextElement.data("right");
                    // if (nextElement != null) {
                    //     arrowPathStart = temp;
                    // }
                }
                //console.log(pathData);
                pathElement.attr("path", pathData);

                // // 绘制箭头
                // let arrowPath = pathElement.data("arrow");
                // let arrowPathData = this.getArrowPathData(arrowPathStart.attr("x") + 2.5, arrowPathStart.attr("y") + 2.5, arrowPathEnd.attr("x") + 2.5, arrowPathEnd.attr("y") + 2.5);
                // arrowPath.attr("path", arrowPathData);
                break;
            }
            case "straight": {
                // 重置
                this.resetPathData(pathElement, pathElement.data("from"), pathElement.data("to"), pathStyle);
                break;
            }
            default: {

            }
        }
    };

    updatePathByControlRect(controlElement) {

        let hostElement = controlElement.data("host");

        // 控制点标志
        let controlPointIndex = controlElement.data("controlPointIndex");
        let leftElement = controlElement.data("left");
        let rightElement = controlElement.data("right");

        let disableRestore = controlElement.data("disableRestore");
        let restore = controlElement.data("restore");
        if (restore) {
            controlElement.attr({
                x: (leftElement.attr("x") + rightElement.attr("x")) / 2,
                y: (leftElement.attr("y") + rightElement.attr("y")) / 2
            });
            if (hostElement.data("container")) {
                this.relativePosition(controlElement, hostElement.data("container"));
            }
            return;
        }

        if (leftElement && leftElement.data("fromNode")) {
            let fromElement = leftElement.data("fromNode");
            let linePathData = this.getLinePathData(fromElement, controlElement, false);
            let pathStartPoint = linePathData.start;
            leftElement.attr({
                x: pathStartPoint.x - 2.5,
                y: pathStartPoint.y - 2.5
            });
            //		if(hostElement.data("container")) {
            //			relativePosition(leftElement,hostElement.data("container"));
            //		}
        }

        if (rightElement && rightElement.data("toNode")) {
            let toElement = rightElement.data("toNode");
            let linePathData = this.getLinePathData(controlElement, toElement, false);
            let pathEndPoint = linePathData.end;
            rightElement.attr({
                x: pathEndPoint.x - 2.5,
                y: pathEndPoint.y - 2.5
            });
            if (hostElement.data("container")) {
                this.relativePosition(rightElement, hostElement.data("container"));
            }
        }

        if (controlPointIndex == -1) {

            // 更新左边的center控制矩形坐标
            let leftDragRect = controlElement.data("leftRect");

            leftDragRect.attr("x", (leftElement.attr("x") + controlElement.attr("x")) / 2);
            leftDragRect.attr("y", (leftElement.attr("y") + controlElement.attr("y")) / 2);

            // 更新右边的center控制矩形坐标
            let rightDragRect = controlElement.data("rightRect");

            rightDragRect.attr("x", (rightElement.attr("x") + controlElement.attr("x")) / 2);
            rightDragRect.attr("y", (rightElement.attr("y") + controlElement.attr("y")) / 2);

            //		if(hostElement.data("container")) {
            //			relativePosition(leftDragRect,hostElement.data("container"));
            //			relativePosition(rightDragRect,hostElement.data("container"));
            //		}

            if (!disableRestore) {
                // 当拖动的矩形元素接近left和right所在的直线时，自动还原到当前直线上
                // 还原处理的操作：
                // a 删除leftDragRect和rightDragRect
                // b controlElement.data("controlPointIndex",0);
                // c 更新left和right2个元素的 left，leftRect，right，rightRect

                // 如何判断？根据直线的斜率?点到直线的距离判断？（更科学）
                let x0 = controlElement.attr("x"), y0 = controlElement.attr("y"),
                    x1 = leftElement.attr("x"), y1 = leftElement.attr("y"),
                    x2 = rightElement.attr("x"), y2 = rightElement.attr("y");

                let h = this.distanceFromPointToLine(
                    x0, y0,
                    x1, y1,
                    x2, y2
                );
                let isOutBoundLine = (x0 - x1) * (x0 - x2) > 0 && (y0 - y1) * (y0 - y2) > 0;
                if (h <= 3 && !isOutBoundLine) {
                    leftDragRect.remove();
                    rightDragRect.remove();
                    controlElement.data("restore", true);
                    // controlElement.data("controlPointIndex",0);

                    leftElement.data("right", rightElement);
                    leftElement.data("rightRect", controlElement);
                    rightElement.data("left", leftElement);
                    rightElement.data("leftRect", controlElement);
                    controlElement.attr({
                        x: (leftElement.attr("x") + rightElement.attr("x")) / 2,
                        y: (leftElement.attr("y") + rightElement.attr("y")) / 2
                    });
                    //				if(hostElement.data("container")) {
                    //					relativePosition(controlElement,hostElement.data("container"));
                    //				}
                }
            }
        } else {
            // 设置标志
            controlElement.data("disableRestore", true);

            // 创建一个控制点和2个伪矩形
            let leftCenterDragRect = this.createControlDragRect((leftElement.attr("x") + controlElement.attr("x") + 5) / 2, (leftElement.attr("y") + controlElement.attr("y") + 5) / 2, hostElement);
            leftCenterDragRect.data("controlPointIndex", 0);
            leftCenterDragRect.data("left", leftElement);
            leftCenterDragRect.data("right", controlElement);

            let rightCenterDragRect = this.createControlDragRect((rightElement.attr("x") + controlElement.attr("x") + 5) / 2, (rightElement.attr("y") + controlElement.attr("y") + 5) / 2, hostElement);
            rightCenterDragRect.data("controlPointIndex", 0);
            rightCenterDragRect.data("left", controlElement);
            rightCenterDragRect.data("right", rightElement);

            //		if(hostElement.data("container")) {
            //			relativePosition(leftCenterDragRect,hostElement.data("container"));
            //			relativePosition(rightCenterDragRect,hostElement.data("container"));
            //		}

            controlElement.data("leftRect", leftCenterDragRect);
            controlElement.data("rightRect", rightCenterDragRect);
            rightElement.data("leftRect", rightCenterDragRect);
            leftElement.data("rightRect", leftCenterDragRect);

            // 更新关系位置
            rightElement.data("left", controlElement);
            leftElement.data("right", controlElement);

            controlElement.data("controlPointIndex", -1);
        }

        // 更新path
        this.updatePath(hostElement);
    };

    updatePathBound(hostElement) {

        let fromNode = hostElement.data("from");
        let toNode = hostElement.data("to");

        // 连线的开始元素
        let startElement = hostElement.data("start");
        let endElement = hostElement.data("end");

        let rightElement = startElement.data("right");
        let startRightRect = startElement.data("rightRect");

        let f = fromNode;
        let t = rightElement;
        if (rightElement == endElement) {
            // 如果path的start的right就是path的end元素，重新计算边界点
            t = toNode;
        }

        let linePathData = this.getLinePathData(f, t, false);
        let pathStartPoint = linePathData.start;

        startElement.attr({
            x: pathStartPoint.x - 2.5,
            y: pathStartPoint.y - 2.5
        });

        startRightRect.attr({
            x: (startElement.attr("x") + rightElement.attr("x")) / 2,
            y: (startElement.attr("y") + rightElement.attr("y")) / 2
        });

        toNode = hostElement.data("to");
        // 连线的开始元素
        let endLeftRect = endElement.data("leftRect");

        let leftElement = endElement.data("left");
        f = leftElement;
        if (startElement == leftElement) {
            f = fromNode;
        }
        t = toNode;
        let endLinePathData = this.getLinePathData(f, t, false);
        let pathEndPoint = endLinePathData.end;
        endElement.attr({
            x: pathEndPoint.x - 2.5,
            y: pathEndPoint.y - 2.5
        });
        endLeftRect.attr({
            x: (leftElement.attr("x") + endElement.attr("x")) / 2,
            y: (leftElement.attr("y") + endElement.attr("y")) / 2
        });

    };

    getContainerBoundary(containerId) {

        // 获取容器2个点的理想坐标(容器的坐标点(x，y)及对角线点(boundaryX,boundaryY))
        let x, y, boundaryX, boundaryY;
        let childElements = this.containers[containerId].elements;
        let containerElement = this.containers[containerId].target;

        x = containerElement.attr("x");
        y = containerElement.attr("y");
        // 设置边界控制容器的初始最小宽高300 150
        boundaryX = containerElement.attr("x") + 300;
        boundaryY = containerElement.attr("y") + 150;

        // 根据容器中的元素，设置容器的最小边界
        for (let childElementId in childElements) {
            let childElement = childElements[childElementId];
            let childElementX = childElement.attr("x");
            let childElementY = childElement.attr("y");
            let width = childElement.attr("width");
            let height = childElement.attr("height");
            boundaryX = Math.max(boundaryX, childElementX + width + 10);
            boundaryY = Math.max(boundaryY, childElementY + height + 10);
        }
        return {
            x: x,
            y: y,
            boundaryX: boundaryX,
            boundaryY: boundaryY
        };
    };

    /**
     * 检测元素是否在容器范围（圈选）
     *
     * @param element
     * @param container
     */
    isDropContainer(element, container) {
        if(!element || !container) return;
        let {x, y} = element.attrs;
        // 暂时根据x,y落点判断是否在容器内
        let {x: containerX, y: containerY, width: containerW, height: containerH} = container.attrs;
        if (x >= containerX && x <= (containerX + containerW)
            && y >= containerY && y <= (containerY + containerH)) {
            return true;
        }
        return false;
    };

    autoContainerSelect(targetElement) {
        // // 设置节点id
        // targetElement.data("nodeId", this.getNumberBy(targetElement.id) + "");
        // let dataType = targetElement.data("type");
        // if (dataType == "rule") {
        //     // 规则节点暂时不支持嵌套，直接return
        //     return;
        // }
        // let containers = this.containers;
        // if (containers) {
        //     let x = targetElement.attr("x");
        //     let y = targetElement.attr("y");
        //     for (let i in containers) {
        //         let container = containers[i];
        //         let containerTargetElement = container.target;
        //
        //         let containerX = containerTargetElement.attr("x");
        //         let containerY = containerTargetElement.attr("y");
        //         let containerW = containerTargetElement.attr("width");
        //         let containerH = containerTargetElement.attr("height");
        //
        //         if (x > containerX && x < (containerX + containerW)
        //             && y > containerY && y < (containerY + containerH)) {
        //             // 绑定关系
        //             targetElement.data("container", containerTargetElement);
        //             // 重置nodeId
        //             let nodeId = this.getNumberBy(containerTargetElement.id) + ":" + this.getNumberBy(targetElement.id);
        //             targetElement.data("nodeId", nodeId);
        //
        //             // 在容器中注册
        //             container.elements[targetElement.id] = targetElement;
        //             // 设置相对位置
        //             this.relativePosition(targetElement, containerTargetElement);
        //             break;
        //         }
        //     }
        // }
    };

    isOutContainerBoundary(x, y, w, h, containerElement) {
        let containerX = containerElement.attr("x");
        let containerY = containerElement.attr("y");
        let containerW = containerElement.attr("width");
        let containerH = containerElement.attr("height");
        if (x > containerX + 5 && x + w < containerX + containerW - 5
            && y > containerY + 5 && y + h < containerY + containerH - 5) {
            // 在容器内
            return false;
        } else {
            return true;
        }
    };

    relativePosition(targetElement, containerElement) {
        let position = {
            x: targetElement.attr("x") - containerElement.attr("x"),
            y: targetElement.attr("y") - containerElement.attr("y")
        };
        targetElement.data("relativePosition", position);
    };

    /*=========data 操作区============*/
    initIdPond(start, end) {
        for (let i = start; i < end; i++) {
            this.idPool.push(i);
        }
    };

    /**
     * 下一个id
     *
     * @returns {*}
     */
    nextId() {
        if (this.idPool.length == 0) {
            this.initIdPond(1, 100);
        }
        if (this.idPool.length == 1) {
            let lastId = this.idPool[0];
            this.initIdPond(lastId + 1, lastId + 100);
        }
        return this.idPool.shift();
    };

    createElementId() {
        return this.toElementId(this.nextId());
    };

    /**
     * 字符串ID
     *
     * @param id
     * @returns {string}
     */
    toElementId(id) {
        return id.toString();
    };

    getNumberBy(elementId) {
        let splitIndex = elementId.indexOf('#');
        if (splitIndex > -1) {
            return Number(elementId.substring(0, splitIndex));
        } else {
            return elementId;
        }
    };

    // 回收id
    recoveryId(id) {
        let idPool = this.idPool;
        if (idPool.includes(id)) {
            idPool.unshift(id);
        }
        // 排序
        idPool.sort(function (a, b) {
            return a - b;
        });
    };

    unbindElementFromContainer(targetElement, container) {
        let containerObj = this.containers[container.id];
        delete containerObj.elements[targetElement.id];
    };

    /**删除一个容器 */
    removeContainer(container) {
        // 删除容器里面的所有元素
        let containerId = container.target.id;
        delete container.elements;
        delete container.target;
        this.unregisterElement(containerId);
        delete this.containers[containerId];
    };

    /** 反注册元素（删除）*/
    unregisterElement(id) {
        if (typeof (id) == "number") {
            this.recoveryId(id);
        }
        this.elements[id] = null;
        delete this.elements[id];
    };

    /** 注册元素*/
    registerElement(target) {
        let id = target.id;
        if (!id) {
            alert(" error，register id is null !");
            return;
        }
        this.elements[id] = target;
        // 如果目标节点是容器节点，注册容器
        if (target.data("type") == "mutiSubProcess") {
            this.registerContainer(target);
        } else if (target.data("type") == "serviceGroup") {
            this.registerContainer(target);
        } else if (target.type == "path") {
            // 解决连线不好选中的问题
            target.hover(function () {
                this.attr("stroke-width", 4);
            }, function () {
                this.attr("stroke-width", 2);
            });
        }

        // init meta
        target.data('meta', target.data('meta') || {});
    };

    /** 注册容器*/
    registerContainer(target) {
        this.containers = this.containers || {};
        this.containers[target.id] = {
            elements: {},
            target: target
        };
    };

    isConnect(fromElement, toElement, reverse) {
        let temp = {};
        let outLines = fromElement.data("out");
        temp[fromElement.id] = fromElement;
        let testCount = 0;
        while (outLines && Object.getOwnPropertyNames(outLines).length) {
            var nextErgodicLines = {};
            for (var i in outLines) {
                var link = outLines[i];
                var to = link.data("to");
                if (to != toElement) {
                    if (!temp[to.id]) {
                        var nextOutLines = to.data("out");
                        for (var j in nextOutLines) {
                            nextErgodicLines[j] = nextOutLines[j];
                        }
                    }
                } else {
                    return true;
                }
            }
            outLines = nextErgodicLines;
            if (testCount++ > 1000) {
                console.log(" maybe bug happen ! ");
                return false;
            }
        }
        // 双向判断
        if (reverse) {
            return this.isConnect(toElement, fromElement, false);
        }

        return false;
    };

    // /** 获取连线的数据*/
    // getConnectData(linkElement) {
    //     let link = {
    //         id: linkElement.id,
    //         type: 'link'
    //     };
    //     let linkMeta = linkElement.data("meta");
    //     link.meta = linkMeta || {};
    //
    //     let attrs = linkElement.attrs;
    //     link.attrs = attrs;
    //
    //     let from = linkElement.data("from");
    //     let to = linkElement.data("to");
    //
    //     // 如果从xor分支过来的link需要指定expressionRequired = true，即使不配置也需要指定
    //     if (from.type == "image") {
    //         let dataType = from.data("type");
    //         let fromDataOptions = from.data("meta");
    //         let optionType = fromDataOptions && fromDataOptions.type;
    //         if (dataType == "diverage" && (optionType == "xor" || optionType == "or")) {
    //             link.meta.orContraint = true;
    //         } else {
    //             delete link.meta.orContraint;
    //         }
    //     }
    //     link.from = this.getNumberBy(from.id);
    //     link.to = this.getNumberBy(to.id);
    //     let arrow = linkElement.data("arrow");
    //     link.arrowAttrs = arrow.attrs;
    //
    //     let pathText = linkElement.data("text");
    //     link.textAttrs = pathText.attrs;
    //     // 获取link的控制点集合
    //     link.meta.linkName = pathText.attr("text");
    //
    //     return link;
    // };

    /**
     * 获取节点上绑定的数据
     *
     * @param element
     * @param datas
     * @returns {{}}
     */
    getElementDatas(element, datas) {
        let elementDatas = {};
        for (let i in datas) {
            let value = element.data(i);
            if (!value) {
                let defaultValue = datas[i];
                let defaultType = typeof defaultValue;
                if (defaultType == "object") {
                    value = {};
                } else if (defaultType == "function") {
                    value = defaultValue(element);
                } else {
                    value = defaultValue;
                }
            }
            elementDatas[i] = value;
        }
        return elementDatas;
    };

    /**
     * 绑定节点的数据
     * @param element
     * @param datas
     * @param node
     */
    setElementDatas(element, datas, node) {
        for (let i in datas) {
            let value = node[i];
            if (!value) {
                let defaultValue = datas[i];
                let defaultType = typeof defaultValue;
                if (defaultType == "object") {
                    value = {};
                } else if (defaultType == "function") {
                    value = defaultValue(element);
                } else {
                    value = defaultValue;
                }
            }
            element.data(i, value);
        }
    };

    /**
     * 判断连线是否为单独的连线，源节点只有一个分支
     * */
    isAloneConnect(connect) {
        let type = connect.type;
        if (type != "path") return null;
        let source = connect.data("from");
        return source && Object.keys(source.data("out")).length == 1;
    };

    /**
     * 判断连线是否来源于网关（split）
     * */
    getSourceGatewayType(connect) {
        let type = connect.type;
        if (type != "path") return null;
        let source = connect.data("from");
        let nodeType = source.data("nodeType");
        if (nodeType != "Split") {
            return null;
        } else {
            return source.data("gateway");
        }
    };

    /**
     * 设置元素名称
     *
     * @param element
     * @param name
     */
    setElementName(element, name) {
        let textEle = null;
        if (element && (textEle = element.data("text"))) {
            textEle.attr("text", name);
        }
    };

    // 设置箭头
    setConnectArrow(connect, stroke) {
        if (connect.node) {
            if (!stroke) {
                stroke = connect.attr("stroke");
                createColorMarker(this.paper.canvas, stroke);
            }
            connect.node.style.markerEnd = `url(#connect-arrow-${stroke})`;
        }
    };

    /**
     * 设置连线颜色
     *
     * @param connect
     * @param color
     */
    setConnectColor(connect, color) {
        connect.attr("stroke", color);
        this.setConnectArrow(connect, color);
        this.setConnectType(connect);
    };

    /**
     * 针对单分支连线设置连线类型（默认类型/条件类型）
     *
     * @param connect
     * @param type(Always,Script,HandlerCall)
     */
    setConnectType(connect, type) {
        if (connect.node) {
            let stroke = connect.attr("stroke");
            createColorMarker(this.paper.canvas, stroke);
            if (!type) {
                type = connect.data("conditionType") || "Always";
            }
            switch (type) {
                case "Always": {
                    connect.data("conditionType", "Always");
                    connect.node.style.markerStart = null;
                    break;
                }
                case "Script":
                case "HandlerCall": {
                    connect.data("conditionType", type);
                    connect.node.style.markerStart = `url(#connect-condition-${stroke})`;
                    break;
                }
                default: {
                    break;
                }
            }
        }
    };

    /**
     * 获取绘制的流程图数据
     *
     * */
    getData() {
        let data = {
            id: this.processId || "",
            name: this.processName || ""
        };
        let startNodeId = null;
        let {elements, containers} = this;
        let nodes = (data.nodes = []), connects = (data.connects = []);
        for (let id in elements) {
            let element = elements[id];
            // 组件类型
            let componentType = element.type;
            // 数据类型
            let dataType = element.data("type");
            // 节点类型
            if (componentType != "path") {
                let node = {};
                let nodeType = element.data("nodeType");
                let textEle = element.data("text");
                if (nodeType == "Start") {
                    startNodeId = id;
                }
                let attrs = {...element.attrs};
                let component = {
                    type: componentType,
                    attrs,
                    textAttrs: textEle && textEle.attrs
                };
                // 移除无关属性，减少输出数据大小
                delete attrs.opacity;
                delete attrs.cursor;
                if (componentType == 'image') {
                    delete attrs.src;
                    delete component.textAttrs;
                }

                // node
                Object.assign(node, {
                    id: element.id,
                    name: textEle && textEle.attr("text"),
                    type: nodeType,
                    ...this.getElementDatas(element, this.nodeDatas),
                    component
                });
                nodes.push(node);
            } else {
                let from = element.data("from");
                let to = element.data("to");
                let pathText = element.data("text");
                let connect = {
                    id: element.id,
                    name: pathText.attr("text"),
                    fromId: from.id,
                    toId: to.id,
                    ...this.getElementDatas(element, this.connectDatas),
                    component: {
                        type: componentType,
                        // 线段(broken)/直线（line）/水平-垂直（h2v）/垂直-水平(v2h)/贝塞尔曲线（curve）
                        attrs: element.attrs,
                        textAttrs: pathText.attrs,
                        // arrowAttrs: element.data("arrow").attrs,
                    }
                }
                connects.push(connect);
            }
        }

        // for (let containerId in containers) {
        //     let container = containers[containerId];
        //     let childElements = container.elements;
        //
        //     // 容器集合根属性
        //     data.containers = data.containers || [];
        //     let dataContainer = {};
        //     // 容器id
        //     dataContainer.containerId = this.getNumberBy(containerId);
        //     dataContainer.elements = [];
        //     for (let childElementId in childElements) {
        //         dataContainer.elements.push(this.getNumberBy(childElementId));
        //     }
        //     data.containers.push(dataContainer);
        // }

        data.startNodeId = startNodeId;

        return data;
    };

    /**
     * 设置数据 回显流程图
     *
     * @param data     输入JSON数据
     */
    setData(data) {
        // 如果传入字符串作为JSON字符串解析为对象
        if (typeof data == "string") {
            try {
                data = JSON.parse(data);
            } catch (err) {
            }
        }
        let {id, name, nodes = [], connects = []} = data || {};
        this.reset();

        this.processId = id;
        this.processName = name;
        // 重构数据结构
        let maxId = 0;
        for (let node of nodes) {
            let {id, type, gateway, component} = node;
            if (!isNaN(id)) {
                maxId = Math.max(maxId, id);
            }
            let element = null;
            switch (type) {
                case "Start": {
                    // element = this.loadImageElement(id, imgs.start, component, "Start");
                    element = this.loadHTMLElement(id, "start", component, "Start"); //.attr({color: this.option.settings.themeColor});
                    this.setElementDatas(element, this.nodeDatas, node);
                    break;
                }
                case "End": {
                    // element = this.loadImageElement(id, imgs.end, component, "End");
                    element = this.loadHTMLElement(id, "end", component, "End"); //.attr({color: this.option.settings.themeColor});
                    this.setElementDatas(element, this.nodeDatas, node);
                    break;
                }
                case "Split": {
                    // 网关类型gateway： xor, or, and
                    let splitType = gateway.toLowerCase();
                    element = this.loadHTMLElement(id, splitType, component, "Split"); //.attr({color: this.option.settings.themeColor});
                    this.setElementDatas(element, this.nodeDatas, node);
                    break;
                }
                case "Join": {
                    element = this.loadHTMLElement(id, "join", component, "Join"); //.attr({color: this.option.settings.themeColor});
                    this.setElementDatas(element, this.nodeDatas, node);
                    break;
                }
                default: {
                    element = this.createNodeElement(node);
                    this.setElementDatas(element, this.nodeDatas, node);
                    element.data("nodeType", type);
                }
            }
            this.elements[id] = element;
        }
        // 初始化 idPool
        this.idPool = [];
        this.initIdPond(maxId + 1, maxId + 100);

        // 如果存在子容器（子流程），在所有元素初始化完毕后开始绑定容器与元素的关系
        // if (editable && data.containers) {
        //     let containers = data.containers;
        //     this.containers = {};
        //     for (let i = 0; i < containers.length; i++) {
        //         let container = containers[i];
        //         let containerId = container.containerId;
        //         // 容器元素
        //         let containerElement = tempElementMap[Number(containerId)];
        //         let containerObj = {
        //             target: containerElement,
        //             elements: []
        //         };
        //         this.containers[containerElement.id] = containerObj;
        //         let childElementIds = container.elements;
        //
        //         for (var j = 0; j < childElementIds.length; j++) {
        //             let childElementId = childElementIds[j];
        //             let childElement = tempElementMap[Number(childElementId)];
        //
        //             // 离线转在线从bpmn解析出来的id如果是子流程中的元素 childElement.id会被重置，此时 != childElementId
        //             // tempElementMap中的key存储的初始的id（重置前的id）
        //             // 用新的id绑定到containerObj.elements中
        //             containerObj.elements[childElement.id] = childElement;
        //             // nodeId
        //             // if (!childElement.data("nodeId") || childElement.data("nodeId").indexOf(":") == -1) {
        //             //     childElement.data("nodeId", containerElement.data("nodeId") + ":" + childElement.data("nodeId"));
        //             // }
        //
        //             //}
        //             childElement.data("container", containerElement);
        //             childElement.data("relativePosition", {
        //                 x: childElement.attr("x") - containerElement.attr("x"),
        //                 y: childElement.attr("y") - containerElement.attr("y")
        //             });
        //
        //         }
        //     }
        // }

        // 最后初始化连线
        for (let i = 0; i < connects.length; i++) {
            let connectData = connects[i];
            let {fromId, toId} = connectData;
            let fromElement = this.elements[fromId];
            let toElement = this.elements[toId];
            let connectElement = this.createConnectElement(connectData, fromElement,
                toElement);
            this.setElementDatas(connectElement, this.connectDatas, connectData);
            this.setConnectType(connectElement, connectData.conditionType);
            this.elements[connectElement.id] = connectElement;
        }

        this.setElementsColor(this.option.settings.themeColor);
    };

    /**
     * 校验返回错误信息，如果通过返回null
     *
     * @returns {null}
     */
    validate() {
        // 校验流程id是否为空
        if (!this.processId) {
            return "流程id不能为空"
        }
        if (!this.processName) {
            return "流程名称不能为空"
        }
        let startNodeIds = [];
        let endNodeIds = [];
        let {elements} = this;
        let nodeElements = [];
        for (let id in elements) {
            let element = elements[id];
            // 组件类型
            let componentType = element.type;
            // 节点类型
            if (componentType != "path") {
                let nodeType = element.data("nodeType");
                let textEle = element.data("text");
                let name = textEle && textEle.attr("text");
                // 入口
                let inLines = element.data("in") || {};
                // 判断是否有出口
                let outLines = element.data("out") || {};
                if (nodeType == "Start") {
                    startNodeIds.push(id);
                    if (Object.keys(outLines).length == 0) {
                        this.setSelectElement(element);
                        return "开始节点没有定义出口";
                    }
                } else if (nodeType == "End") {
                    endNodeIds.push(id);
                    if (Object.keys(inLines).length == 0) {
                        this.setSelectElement(element);
                        return "结束节点没有定义入口";
                    }
                } else {
                    // 没有定义入口
                    if (Object.keys(inLines).length == 0) {
                        this.setSelectElement(element);
                        return `节点[id=${id},name=${name}]没有定义入口`
                    }
                    // 判断是否有出口
                    let outLineKeys = [];
                    if ((outLineKeys = Object.keys(outLines)).length == 0) {
                        this.setSelectElement(element);
                        return `节点[id=${id},name=${name}]没有定义出口`
                    }
                    nodeElements.push(element);
                }
            }
        }

        // 网关（分支）
        let splitElements = [];
        // 网关（聚合）
        let joinElements = [];

        // 检查节点闭环
        for (let nodeElement of nodeElements) {
            let id = nodeElement.id;
            let textEle = nodeElement.data("text");
            let name = textEle && textEle.attr("text");
            // 检查是否存在闭环
            if (this.checkClosedLoop(nodeElement)) {
                this.setSelectElement(nodeElement);
                return `从节点[id=${id},name=${name}]开始存在闭环`
            }
            // 节点类型
            let nodeType = nodeElement.data("nodeType");
            // 网关类型
            let gateway = nodeElement.data("gateway");
            if (nodeType == "Split" && gateway != "xor") {
                splitElements.push(nodeElement);
            }
            if (nodeType == "Join") {
                joinElements.push(nodeElement);
            }
        }

        let startCount = startNodeIds.length;
        if (startCount == 0) {
            return "流程没有找到开始节点"
        } else if (startCount > 1) {
            return "流程开始节点有且只能有一个"
        }
        if (endNodeIds.length == 0) {
            return "流程没有找到结束节点"
        }

        // 配对网关校验
        for (let splitElement of splitElements) {
            let joinElement = this.matchJoinElement(splitElement, joinElements);
            let {id} = splitElement;
            if (!joinElement) {
                this.setSelectElement(splitElement);
                return `并行分支节点[id=${id}]没有匹配到相对应的聚合网关。`
            }
            // 从joinElements中移除joinElement
            let joinIndex = joinElements.indexOf(joinElement);
            joinElements.splice(joinIndex, 1);
        }

        return null;
    };

    // 匹配聚合节点
    matchJoinElement(splitElement, joinElements) {
        if (!joinElements || joinElements.length == 0) return null;
        let exitPaths = this.getExitPaths(splitElement);

        let matchedElements = [];
        for (let joinElement of joinElements) {
            // 检查splitElement和joinElement是否配对
            // 检查从splitElement开始的所有出口路径中是否存在一条路径不经过joinElement；
            // 如果所有的路径都经过joinElement，说明配对成功，否则配对失败；
            // 如果匹配到多个joinElement说明路径存在包含关系，取离分支元素最近的一个聚合网关作为配对网关
            let joinElementId = joinElement.id;
            let continueLoop = false;
            let maxIndex = 0;
            for (let exitPath of exitPaths) {
                let joinIndex = exitPath.indexOf(joinElementId);
                if (joinIndex == -1) {
                    continueLoop = true;
                    break;
                }
                maxIndex = Math.max(maxIndex, joinIndex);
            }
            if (continueLoop) continue;
            matchedElements.push({
                maxIndex, joinElement
            });
        }
        if (matchedElements.length == 0) return null;
        // 返回maxIndex最小的网关
        matchedElements.sort((m1, m2) => {
            return m1.maxIndex > m2.maxIndex ? -1 : 1;
        })
        return matchedElements[0].joinElement;
    };

    /**
     * 获取节点元素的所有出口路径(递归实现)
     *
     * @param element
     * @param excludeKeys
     * @return 二维数组
     */
    getExitPaths(nodeElement, excludeKeys) {
        if (!nodeElement) return null;
        let nodeType = nodeElement.data("nodeType");
        if (nodeType == "End" || nodeType == "Termination") {
            // 出口
            return [[nodeElement.id]];
        }
        let outLines = nodeElement.data("out");
        if (!outLines || Object.keys(outLines).length == 0) {
            // 理论上代码不可达，没有出口的节点视为出口
            return [[nodeElement.id]];
        }
        if (!excludeKeys) excludeKeys = [];
        let exitPaths = [];
        for (let lineId in outLines) {
            let toElement = outLines[lineId].data("to");
            if (!excludeKeys.includes(lineId)) {
                let keys = [...excludeKeys, lineId];
                let outExitPaths = this.getExitPaths(toElement, keys);
                for (let outExitPath of outExitPaths) {
                    outExitPath.unshift(nodeElement.id);
                    exitPaths.push(outExitPath);
                }
            }
        }
        return exitPaths;
    };

    /**
     * 检查节点是否形成了闭环,无法结束
     *
     * @return true 闭环； false 无闭环；
     */
    checkClosedLoop(element) {
        // 是否可关闭的
        let closedAble = (element, historyIds) => {
            let nodeType = element.data("nodeType");
            if (nodeType == "End") {
                return true;
            }
            let id = element.id;
            if (historyIds.includes(id)) {
                return false;
            } else {
                historyIds.push(id);
            }
            let outLines = element.data("out") || {};
            if (Object.keys(outLines).length == 0) {
                return false;
            }
            for (let lineId in outLines) {
                let outLine = outLines[lineId];
                let toElement = outLine.data("to");
                let closed = closedAble(toElement, historyIds);
                if (closed) {
                    // 如果找到了结束返回true
                    return true;
                }
            }
            // 最后返回false
            return false;
        }
        // 不可关闭代表出现闭环
        return !closedAble(element, []);
    };

    /** 设置编辑模式 */
    setEditable(editable) {
        this.option.editable = editable;
        if (!editable) {
            this.hideEditElements(this.selectElement);
        }
        this.endInputEdit();
    };

    /**
     * 根据id获取元素
     */
    getElementById(id) {
        return this.elements[id];
    };

    /**
     * 重置所有元素的颜色
     */
    setElementsColor(color) {
        if (!this.connectColors.includes(color)) {
            this.connectColors.push(color);
            createColorMarker(this.dom, color);
        }

        // 更新元素的颜色
        for (let elementId in this.elements) {
            let element = this.elements[elementId];
            let type = element.type;
            if (type == "path") {
                this.setConnectColor(element, color);
            } else if (type == "html") {
                element.attr("color", color);
            } else {
                element.attr("stroke", color);
            }
        }

        // 更新其他元素的颜色
        let {nw, w, sw, n, s, ne, e, se, dashOuterPath} = this;
        nw.attr("stroke", color);
        w.attr("stroke", color);
        sw.attr("stroke", color);
        n.attr("stroke", color);
        s.attr("stroke", color);
        ne.attr("stroke", color);
        e.attr("stroke", color);
        se.attr("stroke", color);
        dashOuterPath.attr("stroke", color);
        this.groupSelection.attr("stroke", color);
    };

    /**
     * 修改主题颜色
     *
     * @param color
     */
    setThemeColor(color) {
        // 更新主题颜色
        this.option.settings.themeColor = color;
        // 重置元素颜色
        this.setElementsColor(color);
        // 菜单颜色
        this.setMenuStyle({
            color
        });
    };

    /**
     * 完成一条路径
     *
     * @param fromElementId 开始环节的id
     * @param toElementId   结束环节的id
     * @param styles        自定义样式
     */
    complete(fromElementId, toElementId, completeColor) {

        completeColor = completeColor || this.option.settings.completeColor;

        let fromElement = this.getElementById(fromElementId);
        if (!fromElement) {
            alert("开始节点[id=" + fromElementId + "]不存在");
            return;
        }
        let toElement = null, connect = null;
        let connects = fromElement.data("out");
        if (connects) {
            for (let connectId in connects) {
                let conn = connects[connectId];
                let ele = conn.data("to");
                if (ele.id == toElementId) {
                    connect = conn;
                    toElement = ele;
                    break;
                }
            }
        }

        if (!toElement) {
            alert("结束节点[id=" + toElementId + "]不存在或无效");
            return;
        }
        if (fromElement.type == "html") {
            fromElement.attr("color", completeColor);
        } else {
            fromElement.attr({
                stroke: completeColor
            });
        }
        if (toElement.type == "html") {
            toElement.attr("color", completeColor);
        } else {
            toElement.attr({
                stroke: completeColor
            });
        }
        let pathAttr = {
            fill: completeColor,
            stroke: completeColor
        }
        // 路径
        connect.attr(pathAttr); //.data("arrow").attr(pathAttr);
        this.setConnectArrow(connect);
    };

    /**
     * 按节点被完成的顺序进行批量的状态标色
     *
     * */
    completeQueue(elementIds) {
        if (!Array.isArray(elementIds) || elementIds.length < 2) {
            alert("参数错误");
            return;
        }
        let elementId = elementIds[0];
        for (let i = 1, len = elementIds.length; i < len; ++i) {
            this.complete(elementId, elementIds[i]);
            elementId = elementIds[i];
        }
    };

    // 获取connect
    getConnect(fromElementId, toElementId) {
        for (let elementId in this.elements) {
            let element = this.elements[elementId];
            if (element.type == "path") {
                if (element.data("from").id == fromElementId && element.data("to").id == toElementId) {
                    return element;
                }
            }
        }
        return null;
    };

    /** 导出JSON */
    exportJSON() {
        let errorMessage = this.validate();
        if (errorMessage) {
            alert("流程图错误：" + errorMessage);
            return;
        }
        let data = this.getData();
        exportTextFile(JSON.stringify(data, null, 4), `${this.processId || 'flow'}.json`)
    };

    /** 导入文件处理 */
    onImportFile(evt) {
        let me = this;
        let files = evt.target.files;
        if (files && files.length > 0) {
            let file = files[0];
            let name = file.name;
            console.log(name);
            if (!name.toLowerCase().endsWith(".json")) {
                alert("只支持JSON格式文件");
                return;
            }
            console.log(file);
            // new FileReader().re
            let fileReader = new FileReader();
            fileReader.readAsText(file, "utf-8");
            fileReader.onload = (evt) => {
                let text = evt.target.result;
                me.setData(text, true);
            }
        }
        // clear file area values
        evt.target.value = null;
    };

    /** 导入json */
    importJSON() {
        this.fileInput.click();
    };

    /** 导出图片 */
    exportImage() {
        const svg = this.dom;
        const content = new XMLSerializer().serializeToString(svg);// svg.outerHTML;
        const src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(content)))}`;
        console.log(src);
        const img = new Image();
        img.src = src;
        img.onload = () => {
            console.log("onload ");
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            const imgBase64 = canvas.toDataURL('image/png');
            let arr = imgBase64.split(","),
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], {type: "image/png"});
            exportBlob(blob, `${this.processId || 'flow'}.png`);
        }
    };

    /**
     * 清除元素
     */
    clearElements() {
        // 移除绑定
        for (let elementId in this.elements) {
            let element = this.elements[elementId];
            element.remove();
            this.elements[elementId] = null;
        }
        // 清除svg画板
        this.paper.clear();
    };

    /**
     * 重置
     */
    reset() {
        this.clearElements();
        this.initData();
        this.initControlElements();
        this.initPaper();
    };

    /**
     * 销毁
     */
    destroy() {
        this.clearElements();
        this.initData();
        document.removeEventListener("keydown", this.handleDocumentKeyDown);
        document.removeEventListener("keyup", this.handleDocumentKeyUp);
    }
}

/**
 * 简化构建实例api
 * example: wf.render(".flow");
 *
 * @type {{render(*, *)}}
 */
export const wf = {

    /**
     * 将流程设计渲染到指定dom
     *
     * @param selector
     * @param option
     * @return GraphicDesign
     */
    render(selector, option) {
        return new GraphicDesign(selector, option);
    }
}

// 导出类
export default GraphicDesign;